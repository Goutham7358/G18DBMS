
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

const {StudentFarmwork} = require('../models/junctiontables');
Splprojectgrp.Group= Splprojectgrp.belongsTo(Group);

exports.getStudent = async (req,res,next)=>{
    if(req.session.role!='Student'){
        return res.redirect('/person');
    }
    const person = req.user;
    const student = await Student.findOne({where:{personId: person.id}});
    const name = person.FirstName;
    const role = req.session.role;

    const getFarmlist = async (farmworks)=>{
       return Promise.all(
        farmworks.map(async (farmwork)=>{
            let farmworkData = {}
            const activity = await farmwork.getActivity();
            const group = await activity.getGroup();
    
            farmworkData["id"]=farmwork.id;
            farmworkData["hours"] = activity.Hours;
            farmworkData["date"] = activity.Date;
            farmworkData["location"]=activity.Location;
            farmworkData["status"]=group.status;
            farmworkData["feedback"]=farmwork.Feedback;
    
            return farmworkData;
        })
       )
    }

    const getUnjoinedFarmlist = async (farmlist,student)=>{
       return Promise.all(farmlist.map(async (farmworkData)=>{
        const isJoined = await student.hasFarmworks(farmworkData.id);
        console.log("|||||||||||||||||||||||||");
        console.log(isJoined,farmworkData.id);
        if(!isJoined){
            return farmworkData;
        }
        return null;
    })) 
    }
    const getjoinedFarmlist = async (farmlist,student)=>{
        return Promise.all(farmlist.map(async (farmworkData)=>{
         const isJoined = await student.hasFarmworks(farmworkData.id);
         console.log("|||||||||||||||||||||||||");
         console.log(isJoined,farmworkData.id);
         if(isJoined){
             return farmworkData;
         }
         return null;
     })) 
     }

     const getsplgrpmemberlist = async (splgrpmembers)=>{
        return Promise.all(splgrpmembers.map(async (splgrpmember)=>{
            let splgrpmemberData = {}
            const person = await splgrpmember.getPerson();
            splgrpmemberData["studentId"] = splgrpmember.id;
            splgrpmemberData["firstname"] = person.FirstName;
            return splgrpmemberData;

     })) 
     }
    
    const farmworks = await Farmwork.findAll();
    const farmworklist = await getFarmlist(farmworks);
    const unjoinedFarmlist = await getUnjoinedFarmlist(farmworklist,student); // This has null values in place of joined farm works
    const finalunjoinedFarmlist = unjoinedFarmlist.filter((farmworkData)=>farmworkData!=null);

    const joinedFarmlist = await getjoinedFarmlist(farmworklist,student);
    const finaljoinedFarmlist = joinedFarmlist.filter((farmworkData)=>farmworkData!=null);

    const approvedFarmlist = finaljoinedFarmlist.filter((farmworkData)=>farmworkData.status=="Approved");
    const disapprovedFarmlist = finaljoinedFarmlist.filter((farmworkData)=>farmworkData.status=="Disapproved");
    const currentlyRegisteredFarmlist = finaljoinedFarmlist.filter((farmworkData)=>((farmworkData.status!="Approved")&&(farmworkData.status!="Disapproved")));

    let hasSplGrp = false;
    let createdStatus = false;
    let submittedSampleStatus = false;
    let sampleRejected =  false;
    let sampleAccepted = false;
    let submittedFullStatus = false;
    let fullRejected = false;
    let approved = false;

    let splprojectgrpData ={}
    let splgrpmembers = null;
    let splgrpmemberlist =null;

    const splprojectgrp = await student.getSplprojectgrp();
    if(splprojectgrp){
        const group =  await splprojectgrp.getGroup();
         splprojectgrpData = {
        splgrpId: splprojectgrp.id,
        projectname: splprojectgrp.projectName,
        status: group.status
        }
        hasSplGrp=true;
        splgrpmembers = await splprojectgrp.getStudents();
        splgrpmemberlist = await getsplgrpmemberlist(splgrpmembers);

        switch(splprojectgrpData.status){
            case 'Created':   createdStatus=true;
                                    submittedSampleStatus = false;
                                    sampleRejected =  false;
                                    sampleAccepted = false
                                    submittedFullStatus = false;
                                    fullRejected = false;
                                    approved = false;
                                    break;
            case 'submittedSample':   createdStatus=false;
                                            submittedSampleStatus = true;
                                            sampleRejected =  false;
                                            sampleAccepted = false;
                                            submittedFullStatus = false;
                                            fullRejected = false;
                                            approved = false;
                                            break;
            case 'sampleRejected':  createdStatus=false;
                                    submittedSampleStatus = false;
                                    sampleRejected =  true;
                                    sampleAccepted = false;
                                    submittedFullStatus = false;
                                    fullRejected = false;
                                    approved = false;
                                    break;
            case 'sampleAccepted':  createdStatus=false;
                                    submittedSampleStatus = false;
                                    sampleRejected =  false;
                                    sampleAccepted = true;
                                    submittedFullStatus = false;
                                    fullRejected = false;
                                    approved = false;
                                    break;
            case 'submittedFull':    createdStatus=false;
                                            submittedSampleStatus = false;
                                            sampleRejected =  false;
                                            sampleAccepted = false;
                                            submittedFullStatus = true;
                                            fullRejected = false;
                                            approved = false;
                                            break;
            case 'fullRejected':    createdStatus=false;
                                    submittedSampleStatus = false;
                                    sampleRejected =  false;
                                    sampleAccepted = false;
                                    submittedFullStatus = false;
                                    fullRejected = true;
                                    approved = false;
                                    break;
            case 'approved':        createdStatus=false;
                                    submittedSampleStatus = false;
                                    sampleRejected =  false;
                                    sampleAccepted = false;
                                    submittedFullStatus = false;
                                    fullRejected = false;
                                    approved = true;
                                    break;
            default: console.log("Error in status");
                    break;
                                                                            
        }

    }
    
     


    console.log("????????????????????????");
    console.log(farmworklist);

    res.render('student',{
        name: name,
        role: role,
        unjoinedfarmworklist: finalunjoinedFarmlist,
        approvedFarmlist: approvedFarmlist,
        disapprovedFarmlist: disapprovedFarmlist,
        currentlyRegisteredFarmlist: currentlyRegisteredFarmlist,
        student: student,
        splprojectgrpData: splprojectgrpData,
        splgrpmemberlist: splgrpmemberlist,
        hasSplGrp: hasSplGrp,
        createdStatus: createdStatus,
        submittedSampleStatus: submittedSampleStatus,
        sampleRejected:sampleRejected,
        sampleAccepted: sampleAccepted,
        submittedFullStatus: submittedFullStatus,
        fullRejected: fullRejected,
        approved: approved,
        
    })
    
}

exports.postJoinfarmwork = async (req,res,next)=>{
    const farmworkId = req.body.farmworkId;
    const person = req.session.user;
    const student = await Student.findOne({where:{personId: person.id}});
    await student.addFarmworks([farmworkId])
    res.redirect('/student');
}

exports.getCreateSplGrp = async (req,res,next)=>{
    if(req.session.role!='Student'){
        return res.redirect('/person');
    }
    const person = req.user;
    const student = await Student.findOne({where:{personId: person.id}});
    const name = person.FirstName;
    const role = req.session.role;

    const createdStatus=req.query.createdStatus;
    const submittedSampleStatus = req.query.submittedSampleStatus;
    const sampleRejected =  req.query.sampleRejected;
    const sampleAccepted = req.query.sampleAccepted;
    const submittedFullStatus = req.query.submittedFullStatus;
    const fullRejected = req.query.fullRejected;
    const approved = req.query.approved;

    const getsplgrpmemberlist = async (splgrpmembers)=>{
        return Promise.all(splgrpmembers.map(async (splgrpmember)=>{
            let splgrpmemberData = {}
            const person = await splgrpmember.getPerson();
            splgrpmemberData["studentId"] = splgrpmember.id;
            splgrpmemberData["firstname"] = person.FirstName;
            return splgrpmemberData;

     })) 
     }

    let splprojectdata = {};
    const splprojectgrp = await student.getSplprojectgrp();
    let splgrpmemberlist = []
    if(splprojectgrp){
        const splgrpmembers = await splprojectgrp.getStudents();
         splgrpmemberlist = await getsplgrpmemberlist(splgrpmembers)

        splprojectdata["projectname"] = splprojectgrp.projectName;
        splprojectdata["sampledescription"] = splprojectgrp.SampleDescription;
        splprojectdata["fulldescription"] = splprojectgrp.FullDescription;
        splprojectdata["samplefeedback"] = splprojectgrp.Samplefeedback;
        splprojectdata["feedback"] = splprojectgrp.Feedback;
        

    }

    res.render('createsplgrp',{
        studentId: student.id,
        name: name,
        role: role,
        createdStatus: createdStatus,
        submittedSampleStatus: submittedSampleStatus,
        sampleRejected:sampleRejected,
        sampleAccepted: sampleAccepted,
        submittedFullStatus: submittedFullStatus,
        fullRejected: fullRejected,
        approved: approved,
        splprojectdata: splprojectdata,
        splgrpmemberlist: splgrpmemberlist
       
    })


}

exports.postCreateSplGrp = async (req,res,next)=>{
    const studentId = req.body.studentId;
   
    let status = "Created"

    const student = await Student.findByPk(studentId);
    let splprojectgrp = await student.getSplprojectgrp();
    let group = null;
    if(splprojectgrp){
        group = await splprojectgrp.getGroup();
    }
    

    const createdStatus=req.query.createdStatus;
    const submittedSampleStatus = req.query.submittedSampleStatus;
    const sampleRejected =  req.query.sampleRejected;
    const sampleAccepted = req.query.sampleAccepted;
    const submittedFullStatus = req.query.submittedFullStatus;
    const fullRejected = req.query.fullRejected;
    const approved = req.query.approved;

    const sampledescription = req.body.sampledescription;
    const fulldescription = req.body.fulldescription;

    

    if(createdStatus){
        await splprojectgrp.update({SampleDescription: sampledescription})
        await group.update({status: "submittedSample"})
    } else if (submittedSampleStatus){
       await  splprojectgrp.update({SampleDescription: sampledescription})
       await group.update({status: "submittedSample"})
    } else if(sampleRejected) {
        await  splprojectgrp.update({SampleDescription: sampledescription})
        await group.update({status: "submittedSample"})
    } else if(sampleAccepted){
       await splprojectgrp.update({FullDescription: fulldescription})
       await group.update({status: "submittedFull"})
    } else if(submittedFullStatus){
        await splprojectgrp.update({FullDescription: fulldescription})
        await group.update({status: "submittedFull"})
    } else if(fullRejected){
        await splprojectgrp.update({FullDescription: fulldescription})
        await group.update({status: "submittedFull"})
    }
    else {
        const student1Id = req.body.student1;
        const student2Id = req.body.student2;
        const student3Id = req.body.student3;
        const projectName = req.body.projectName;

        await student.createSplprojectgrp({
            projectName: projectName,
            group:{
                status: status
            }
        },{
            include: [Splprojectgrp.Group]
        });
    
         splprojectgrp = await student.getSplprojectgrp();
    
        await splprojectgrp.addStudents([student1Id,student2Id,student3Id]);

    }


    

    res.redirect('/student');
}