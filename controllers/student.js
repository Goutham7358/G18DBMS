const { Farmwork } = require('../models/group');
const {People,
    Faculty,
    Student,
    Nssvolunteer,
    Farmhead,
    Socialhead,
    Splvolunteer} = require('../models/people');

exports.getStudent = async (req,res,next)=>{
    if(req.session.role!='Student'){
        return res.redirect('/person');
    }
    const person = req.user;
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
    
            return farmworkData;
        })
       )
    }

    const farmworks = await Farmwork.findAll();
    const farmworklist = await getFarmlist(farmworks);

    console.log("????????????????????????");
    console.log(farmworklist);

    res.render('student',{
        name: name,
        role: role,
        farmworklist: farmworklist
    })
    
}