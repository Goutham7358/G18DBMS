const {People,
    Faculty,
    Student,
    Nssvolunteer,
    Farmhead,
    Socialhead,
    Splvolunteer} = require('../models/people');

 const { Farmwork } = require('../models/group');

 const { StudentFarmwork} = require('../models/junctiontables');


exports.getNssvolunteer = async (req,res,next)=>{
    if(req.session.role!='Nssvolunteer'){
        return res.redirect('/');
    }
    const person = req.user;
    const role = req.session.role;
    const nssvolunteer = await Nssvolunteer.findOne({where:{personId: person.id}});

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
     
             return farmworkData;
         })
        )
     }

    const openfarmworks =  await Farmwork.findAll({where:{nssvolunteerId:null}});
    const openfarmworklist = await getFarmlist(openfarmworks);

    const takenfarmworks = await Farmwork.findAll({where:{nssvolunteerId: nssvolunteer.id}})
    const takenfarmworklist = await getFarmlist(takenfarmworks);

    const allocatedfarmworklist = takenfarmworklist.filter((takenfarmwork)=>takenfarmwork.status==="Allocated");
    const submitedfarmworklist = takenfarmworklist.filter((takenfarmwork)=>takenfarmwork.status==="Submitted for approval");
    const approvedfarmworklist = takenfarmworklist.filter((takenfarmwork)=>takenfarmwork.status==="Approved");
    const disapprovedfarmworklist = takenfarmworklist.filter((takenfarmwork)=>takenfarmwork.status==="Disapproved");

    res.render('nssvolunteer',{
        name: person.FirstName,
        role: role,
        openfarmworklist: openfarmworklist,
        allocatedfarmworklist: allocatedfarmworklist,
        submitedfarmworklist: submitedfarmworklist,
        approvedfarmworklist:approvedfarmworklist,
        disapprovedfarmworklist:disapprovedfarmworklist
    })

}

exports.postTakefarmwork = async (req,res,next)=>{
    const person = req.user;
    const nssvolunteer = await Nssvolunteer.findOne({where:{personId: person.id}});
    const openfarmworkId = req.body.openfarmworkId;
    await nssvolunteer.addFarmwork(openfarmworkId);
    res.redirect('/nssvolunteer');
}

exports.getGiveproof = async (req,res,next)=>{
    const person = req.user;
    const nssvolunteer =  await Nssvolunteer.findOne({where:{personId: person.id}});
    const farmworkId = req.params.takenfarmId;
    const editmode = req.query.edit;
    const disapprovemode = req.query.disapprove;
    const seemode = req.query.see;
    const getStudentlist = async (students,farmworkId)=>{
        return Promise.all(
         students.map(async (student)=>{
             let studentData = {}
             const person = await student.getPerson();
             const studentfarmworkInstance = await StudentFarmwork.findOne({where:{
                studentId: student.id,
                farmworkId: farmworkId
            }});

            const attendence = studentfarmworkInstance.attendence;
             
            studentData["id"]=student.id;
            studentData["firstname"]=person.FirstName;
            studentData["lastname"]=person.LastName;
            studentData["attendence"] = attendence;

             return studentData;
         })
        )
     }

    const farmwork = await Farmwork.findByPk(farmworkId);
    const activity = await farmwork.getActivity();
    const group = await activity.getGroup();
    const farmworkObj = {
        id: farmwork.id,
        hours: activity.Hours,
        date: activity.Date,
        location: activity.Location,
        status: group.status,
        proof: farmwork.Proof,
        feedback: farmwork.Feedback
    }

    const students = await farmwork.getStudents();
    const studentList = await getStudentlist(students,farmworkId);

    console.log(students);
    console.log(studentList);
    console.log("Students registered in this farm work");

    res.render('proof',{
        farmwork: farmworkObj,
        studentList: studentList,
        editmode: editmode,
        disapprovemode: disapprovemode,
        seemode: seemode
    })

}


exports.postFarmproof = async (req,res,next)=>{
    console.log("Here i am!!");
    const farmworkId = req.body.farmworkId;
    const proof = req.body.proof;
    const farmwork = await Farmwork.findByPk(farmworkId);
    const students = await farmwork.getStudents();
    const activity = await farmwork.getActivity();
    const group = await activity.getGroup();

    const updateAttendence = async (students,farmworkId,req)=>{
        console.log(students);
      return Promise.all(students.map(async (student)=>{
        let bool=false;
        if(req.body[student.id]=="true"){
            bool=true;
        }
        if(bool) {
            await StudentFarmwork.update({attendence: true},{
                where:{studentId: student.id,
                    farmworkId: farmworkId
                }
            })
        }
        else {
            await StudentFarmwork.update({attendence: false},{
                where:{studentId: student.id,
                    farmworkId: farmworkId
                }
            })
        }
       
    }))  
    }

    await updateAttendence(students,farmworkId,req);

    await group.update({status: "Submitted for approval"});

    await farmwork.update({Proof: proof })

    res.redirect('/nssvolunteer');
}