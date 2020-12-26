const {People,
    Faculty,
    Student,
    Nssvolunteer,
    Farmhead,
    Socialhead,
    Splvolunteer} = require('../models/people');

const Admin = require("../models/admin");

Student.Person = Student.belongsTo(People);
Farmhead.Person = Farmhead.belongsTo(People);


exports.getAddperson = (req,res,next)=>{
    if(req.session.role!="Admin"){
        return res.redirect('/person');
    }
    res.render('admin');
}

exports.postAddperson = (req,res,next)=>{
    const role=req.body.role;
    const firstname = req.body.firstname;
    const lastname = req.body.lastname;
    const password = req.body.password;
    const department = req.body.department;

    switch(role){
        case 'Student': Student.create({
            person: {
                    FirstName: firstname,
                    LastName: lastname,
                    Password: password,
                    Department: department
            },},
            {
                include:[Student.Person]
            }
        ).then(result=>{
            console.log("Created By Admin!!!!!");
            console.log(result);
            res.redirect('/person');
        })
        break;
    case 'Farmhead': Farmhead.create({
        person: {
                FirstName: firstname,
                LastName: lastname,
                Password: password,
                Department: department
        },},
        {
            include:[Farmhead.Person]
        }).then(result=>{
            console.log("Created By Admin!!!!!");
            console.log(result);
            res.redirect('/farmhead');
        })
        break;
    case 'Admin': Admin.create({
        FirstName: firstname,
        LastName: lastname,
        Password: password
    })
    break;
        default:
            console.log("Error!")
    }

}