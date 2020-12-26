const Admin = require("../models/admin");
const {People} = require("../models/people");

exports.getLogin = (req,res,next)=>{
    if(req.session.isLoggedIn){
        return  res.redirect('/');
      }
    res.render('login');
}

exports.postLogin = (req,res,next)=>{
    const firstname = req.body.firstname;
    const password = req.body.password;
    const role = req.body.role;
    if(role=="Admin"){
      Admin.findOne({where:{FirstName: firstname}})
      .then(admin=>{
        req.session.isLoggedIn=true;
        req.session.user=admin;
        req.session.role=role;
        req.session.save(err=>{
          console.log(err);
          res.redirect('/addperson');
        })
      })
      .catch(err=>console.log(err))
      // People.findByPk(1)
      // .then(ppl=>{
      //   console.log("Well I am Here!!!");
      //   req.session.isLoggedIn=true;
      //   req.session.user=ppl;
      //   req.session.role=role;
      //   res.redirect('/addperson');
      // })
    }
    else{
      People.findOne({where:{FirstName: firstname}})
    .then(people=>{
        req.session.isLoggedIn=true;
        req.session.user=people;
        req.session.role=role;
        req.session.save(err=>{
          switch(role){
            case 'FarmHead': res.redirect('/farmhead');
            break;
            default:
              res.redirect('/');
              break;
          }
        })
    })
    .catch(err=>console.log(err))
    }
    
}

exports.getPerson = (req,res,next)=>{
    console.log(req.session.isLoggedIn);
    console.log(req.user);
    if(!req.session.isLoggedIn){
      return  res.redirect('/login');
    }
    res.render('people',{
        name: req.session.user.FirstName,
        role: req.session.role
    })
}

exports.postLogout = (req, res, next) => {
    console.log("DELETING SESSION!!!!!");
    req.session.destroy(err => {
      console.log(err);
      console.log("LOGGED OUT!!!")
      res.redirect('/login');
    });
  };
