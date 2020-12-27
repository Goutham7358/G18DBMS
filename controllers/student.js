const { Farmwork } = require('../models/group');
const {People,
    Faculty,
    Student,
    Nssvolunteer,
    Farmhead,
    Socialhead,
    Splvolunteer} = require('../models/people');

const {StudentFarmwork} = require('../models/junctiontables');

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
    const farmworks = await Farmwork.findAll();
    const farmworklist = await getFarmlist(farmworks);
    const unjoinedFarmlist = await getUnjoinedFarmlist(farmworklist,student); // This has null values in place of joined farm works
    const finalunjoinedFarmlist = unjoinedFarmlist.filter((farmworkData)=>farmworkData!=null);

    const joinedFarmlist = await getjoinedFarmlist(farmworklist,student);
    const finaljoinedFarmlist = joinedFarmlist.filter((farmworkData)=>farmworkData!=null);

    const approvedFarmlist = finaljoinedFarmlist.filter((farmworkData)=>farmworkData.status=="Approved");
    const disapprovedFarmlist = finaljoinedFarmlist.filter((farmworkData)=>farmworkData.status=="Disapproved");
    const currentlyRegisteredFarmlist = finaljoinedFarmlist.filter((farmworkData)=>((farmworkData.status!="Approved")&&(farmworkData.status!="Disapproved")));


    console.log("????????????????????????");
    console.log(farmworklist);

    res.render('student',{
        name: name,
        role: role,
        unjoinedfarmworklist: finalunjoinedFarmlist,
        approvedFarmlist: approvedFarmlist,
        disapprovedFarmlist: disapprovedFarmlist,
        currentlyRegisteredFarmlist: currentlyRegisteredFarmlist,
        student: student
    })
    
}

exports.postJoinfarmwork = async (req,res,next)=>{
    const farmworkId = req.body.farmworkId;
    const person = req.session.user;
    const student = await Student.findOne({where:{personId: person.id}});
    await student.addFarmworks([farmworkId])
    res.redirect('/student');
}