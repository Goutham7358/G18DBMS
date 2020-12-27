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

Farmhead.Farmworks = Farmhead.hasMany(Farmwork);

Farmwork.Activity = Farmwork.belongsTo(Activity);
Activity.Group=Activity.belongsTo(Group);

const getStudentlist = async (students)=>{
    return Promise.all(
     students.map(async (student)=>{
         let studentData = {}
         const person = await student.getPerson();
         
        studentData["id"]=student.id;
        studentData["firstname"]=person.FirstName;
        studentData["lastname"]=person.LastName;

         return studentData;
     })
    )
 }

 const getPresentStudents = async (students,submittedfarmId) =>{
    return Promise.all(
        students.map(async (student)=>{
            const studentfarmworkInstance = await StudentFarmwork.findOne({where:{
                studentId: student.id,
                farmworkId: submittedfarmId
            }});

            const attendence = studentfarmworkInstance.attendence;
            if(attendence){
                return student;
            }else{
                return null;
            }
        })
       )
 }

 const giveAttendence = async (students,farmHour)=>{
    return Promise.all(
        students.map(async (student)=>{
            const farmworkHour = student.FarmWorkHours;
            const updatedfarmworkHour = farmworkHour+farmHour;

            await student.update({FarmWorkHours: updatedfarmworkHour })
        })
       )
 }

exports.getFarmhead = async (req,res,next)=>{
    if(req.session.role!="Farmhead"){
       return res.redirect('/');
    }

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

    const person = req.user;
    const farmHead  = await Farmhead.findOne({where:{personId: person.id}});
    const farmworks = await farmHead.getFarmworks();
    const farmworklist = await getFarmlist(farmworks);
    const submitedfarmworklist = farmworklist.filter((farmworkData)=>farmworkData.status==="Submitted for approval");

    res.render('farmhead',{
        name: req.user.FirstName,
        farmHeadId: farmHead.id,
        submitedfarmworklist: submitedfarmworklist
    });
}

exports.postFarmwork = (req,res,next)=>{
    const status = req.body.status;
    const hours = req.body.hours;
    const date = req.body.date;
    const location = req.body.location;

    const person = req.user;
    console.log(person);
     Farmhead.findOne({where:{personId: person.id}}).then(farmhead=>{
        console.log(farmhead);
        farmhead.createFarmwork({
            activity:{
                Hours: hours,
                Date: date,
                Location: location,
                group:{
                    status: status
                }
            }
        },{
            include:[{
                association: Farmwork.Activity,
                include: [Activity.Group]
            }]
        }).then(result=>{
            console.log(result);
            res.redirect('/farmhead');
        })
        .catch(err=>{console.log(err);
            res.redirect('/');
        })
     })
     .catch(err=>{
         console.log(err);
         res.redirect('/');
     })
   
}

exports.getApprovefarmproof = async (req,res,next)=>{
    const submittedfarmId = req.params.submittedfarmId;
    const submittedfarmwork = await Farmwork.findByPk(submittedfarmId);
    const activity = await submittedfarmwork.getActivity();
    const group = await activity.getGroup();
    const nssvolunteerId = submittedfarmwork.nssvolunteerId;
    const nssvolunteer = await Nssvolunteer.findByPk(nssvolunteerId);
    const personId = nssvolunteer.personId;
    const person = await People.findByPk(personId); 
    const farmworkObj = {
        id: submittedfarmwork.id,
        hours: activity.Hours,
        date: activity.Date,
        location: activity.Location,
        status: group.status,
        proof: submittedfarmwork.Proof,
        nssvolunteerId: nssvolunteerId,
        firstname: person.FirstName
    }

    const students = await submittedfarmwork.getStudents();
    const presentStudents = await getPresentStudents(students,submittedfarmId);
    const finalpresentStudents = presentStudents.filter((student)=>student!=null);
    const studentList = await getStudentlist(finalpresentStudents);

    res.render('approve',{
        farmwork: farmworkObj,
        studentList: studentList,
    })

}

exports.postApprovefarmproof = async (req,res,next)=>{
    const approvalStatus = req.body.approvalStatus;
    const farmworkId = req.body.farmworkId;
    const feedback = req.body.feedback;
    const farmwork = await Farmwork.findByPk(farmworkId);
    const activity = await farmwork.getActivity();
    const group = await activity.getGroup();
    if(approvalStatus!="approve"){
        await activity.update({Feedback: feedback});
        await group.update({status: "Disapproved" });
        return res.redirect('/farmhead');
    }
   
    const students = await farmwork.getStudents();
    const presentStudents = await getPresentStudents(students,farmworkId);
    const finalpresentStudents = presentStudents.filter((student)=>student!=null);

    await giveAttendence(finalpresentStudents,activity.Hours);
    await activity.update({Feedback: feedback});
    await group.update({status: "Approved" });

    res.redirect('/farmhead');
}
