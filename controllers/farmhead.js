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

Farmhead.Farmworks = Farmhead.hasMany(Farmwork);

Farmwork.Activity = Farmwork.belongsTo(Activity);
Activity.Group=Activity.belongsTo(Group);

exports.getFarmhead = (req,res,next)=>{
    if(req.session.role!="Farmhead"){
       return res.redirect('/');
    }
    const person = req.user;
     Farmhead.findOne({where:{personId: person.id}})
     .then(farmHead=>{
        res.render('farmhead',{
            name: req.user.FirstName,
            farmHeadId: farmHead.id
        });
     })
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