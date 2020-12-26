const {People,
    Faculty,
    Student,
    Nssvolunteer,
    Farmhead,
    Socialhead,
    Splvolunteer} = require('../models/people');

 const { Farmwork } = require('../models/group');


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

    res.render('nssvolunteer',{
        name: person.FirstName,
        role: role,
        openfarmworklist: openfarmworklist,
        takenfarmworklist: takenfarmworklist
    })

}

exports.postTakefarmwork = async (req,res,next)=>{
    const person = req.user;
    const nssvolunteer = await Nssvolunteer.findOne({where:{personId: person.id}});
    const openfarmworkId = req.body.openfarmworkId;
    await nssvolunteer.addFarmwork(openfarmworkId);
    res.redirect('/nssvolunteer');
}