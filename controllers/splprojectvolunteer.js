const {People,
    Faculty,
    Student,
    Nssvolunteer,
    Farmhead,
    Socialhead,
    Splvolunteer} = require('../models/people');
const { Group,
    Activity,
    Farmwork,
    Socialwork,
    Splprojectgrp
} = require('../models/group');
const { StudentFarmwork } = require('../models/junctiontables');

const getSplprojectgrplist = async (splprojectgrps)=>{
    return Promise.all(
        splprojectgrps.map(async (splprojectgrp)=>{
            let splprojectgrpData = {}
            const group = await splprojectgrp.getGroup();

            splprojectgrpData["splprojectgrpId"] = splprojectgrp.id;
            splprojectgrpData["status"] = group.status;
            splprojectgrpData["projectname"] = splprojectgrp.projectName;
            splprojectgrpData["sampledescription"] = splprojectgrp.SampleDescription;
            splprojectgrpData["fulldescription"] = splprojectgrp.FullDescription;
            splprojectgrpData["feedback"] = splprojectgrp.Feedback;
            splprojectgrpData["samplefeedback"]=splprojectgrp.Samplefeedback;

            return splprojectgrpData;
        })
    );
}

const getSamplestagegrps = async (splprojectgrps)=>{
    return Promise.all(
        splprojectgrps.map(async (splprojectgrp)=>{
            const group = await splprojectgrp.getGroup();

            if(group.status=="submittedSample"){
                return splprojectgrp;
            }
            return null;
        })
    );
}

const getFullstagegrps = async (splprojectgrps)=>{
    return Promise.all(
        splprojectgrps.map(async (splprojectgrp)=>{
            const group = await splprojectgrp.getGroup();

            if(group.status=="submittedFull"){
                return splprojectgrp;
            }
            return null;
        })
    );
}

exports.getSplprojectvolunteer = async (req,res,next)=>{
    const person = req.user;
    const splprojectvolunteer = await Splvolunteer.findOne({where:{personId: person.id}});
    const role = req.session.role;
    

    const opensplprojectgrps = await Splprojectgrp.findAll({where: {splvolunteerId: null}});
    const opensplprojectgrpslist = await getSplprojectgrplist(opensplprojectgrps);

    const takensplprojectgrps = await Splprojectgrp.findAll({where: {splvolunteerId: splprojectvolunteer.id }});

    const takensamplestagegrps = await getSamplestagegrps(takensplprojectgrps);
    const filteredsamplestagegrps = takensamplestagegrps.filter((splprojectgrp)=>splprojectgrp!=null);
    const takensamplegrpslist = await getSplprojectgrplist(filteredsamplestagegrps);

    const takenfullstagegrps = await getFullstagegrps(takensplprojectgrps);
    const  filteredfullstagegrps = takenfullstagegrps.filter((splprojectgrp)=>splprojectgrp!=null);
    const takenfullgrpslist = await getSplprojectgrplist(filteredfullstagegrps);

    res.render('splprojectvolunteer',{
        name: person.FirstName,
        splvolunteerId: splprojectvolunteer.id,
        opensplprojectgrpslist: opensplprojectgrpslist,
        takensamplegrpslist: takensamplegrpslist,
        takenfullgrpslist: takenfullgrpslist,
        role: role
    })

}

exports.postTakesplprojectgrp = async (req,res,next)=>{
    const person = req.user;
    const splprojectvolunteer = await Splvolunteer.findOne({where:{personId: person.id}});

    const splprojectgrpId = req.body.splprojectgrpId;


    console.log("HERE--------------------");
    console.log(splprojectgrpId);
    console.log(splprojectvolunteer);
    console.log("---------------------");

    await splprojectvolunteer.addSplprojectgrp(splprojectgrpId);

    res.redirect('/splprojectvolunteer');
}

exports.getApprovesplprojectgrp = async (req,res,next)=>{
    const splprojectgrpId  = req.params.splprojectgrpId;
    const sample = req.query.sample;

    const person = req.user;
    const splprojectvolunteer = await Splvolunteer.findOne({where:{personId: person.id}});

    const splprojectgrp = await Splprojectgrp.findByPk(splprojectgrpId);
    let splprojectgrpData = {}
    const group = await splprojectgrp.getGroup();

    splprojectgrpData["splprojectgrpId"] = splprojectgrp.id;
    splprojectgrpData["status"] = group.status;
    splprojectgrpData["projectname"] = splprojectgrp.projectName;
    splprojectgrpData["sampledescription"] = splprojectgrp.SampleDescription;
    splprojectgrpData["fulldescription"] = splprojectgrp.FullDescription;
    splprojectgrpData["feedback"] = splprojectgrp.Feedback;
    splprojectgrpData["samplefeedback"]=splprojectgrp.Samplefeedback;

    res.render('approvesplproject',{
        name: person.FirstName,
        splprojectvolunteerId: splprojectvolunteer.id,
        sample: sample,
        splprojectgrpData: splprojectgrpData,
    })
}

exports.postApprovesplprojectgrp = async (req,res,next)=>{
    const splprojectgrpId = req.body.splprojectgrpId;
    const splprojectgrp = await Splprojectgrp.findByPk(splprojectgrpId);
    const group = await splprojectgrp.getGroup();
    const students = await splprojectgrp.getStudents();

    const sample = req.query.sample;

    const approvalStatus = req.body.approvalStatus;

    const giveAttendence = async (students,hour)=>{
        return Promise.all(
            students.map(async (student)=>{
                const splprojecthours = student.SplProjectHours;
                const updatedsplprojecthours = splprojecthours+hour;

                await student.update({SplProjectHours: updatedsplprojecthours});

            })
        );
    }

    if(sample){
        const samplefeedback = req.body.samplefeedback;

        if(approvalStatus=="disapprove"){
            await splprojectgrp.update({Samplefeedback: samplefeedback});
            await group.update({status: "sampleRejected"});
        }else{
            await splprojectgrp.update({Samplefeedback: samplefeedback});
            await group.update({status: "sampleAccepted"});
            await giveAttendence(students,5);
        }
    }else{
        const feedback = req.body.feedback;

        if(approvalStatus=="disapprove"){
            await splprojectgrp.update({Feedback: feedback});
            await group.update({status: "fullRejected"});
        } else {
            await splprojectgrp.update({Feedback: feedback});
            await group.update({status: "approved"});
            await giveAttendence(students,10);
        }
    }

    res.redirect('/splprojectvolunteer');
}
