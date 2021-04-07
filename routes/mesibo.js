const router = require('express').Router();
const axios = require('axios').default;
const uniqId = require('uniqid');
const { User } = require('../models/user.model');

const mesibo_url = 'https://api.mesibo.com/api.php';
const mesibo_token = process.env.MESIBO_TOKEN;

const routes = () => {
  router.route('/get-user')
    .get(async (req, res) => {
      // Get details from client
      const { userId, mesibo_appid } = req.query;
      try {
        // Find user in db
        const user = await User.findOne({ user_id: userId });

        if (user) { //user exists
          const user_mesibo_address = user.registered_with === 'email' ? user.email : user.phone;
          const config = { // set mesibo params
            params: {
              token: mesibo_token,
              op: 'usersget',
              count: 20,
              addr: user_mesibo_address
            }
          };
          // Get mesibo user
          const mesibo_user = await axios.get(mesibo_url, config);

          if (mesibo_user.data.users.length > 0) { // user exits in mesibo
            // remove user from users array
            const mesibo_user_web = mesibo_user.data.users.find((x) => x.address === user_mesibo_address && x.appid === mesibo_appid);
            return res.status(200).json({ // send user back to client
              status: true,
              user: mesibo_user_web
            });
          }

          // create mesibo user
          // modify params object in config
          config.params.op = 'useradd';
          config.params.addr = user_mesibo_address;
          config.params.appid = mesibo_appid;
          config.params.name = `${user.first_name} ${user.last_name}`;
          delete config.params.count;

          // request to create user
          const new_mesibo_user = await axios.get(mesibo_url, config);

          if (new_mesibo_user.data.result) { // user created
            new_mesibo_user.data.user.address = user_mesibo_address; // pass the address you used to create the user in the mesibo response
            return res.status(201).json({
              status: true,
              user: new_mesibo_user.data.user
            });
          }

          return res.status(400).json({ // user not created, send error
            status: false,
            error: new_mesibo_user.data
          });

        }
        return res.status(404).json({ // user does not exist in db
          status: false,
          error: 'user not found'
        });
      } catch (error) {
        return res.status(500).json({
          status: false,
          error: error.message
        });
      }

    });

    /* NOTE: THIS ENDPOINT WAS CREATED TO CREATE DUMMY LOCAL USERS IN MONGODB FOR TESTING */
  router.route('/create-user')
    .post(async (req, res) => {
      const { email, phone, firstName, lastName } = req.body;

      const new_user = {
        user_id: uniqId(),
        email: email ? email : null,
        phone: phone ? Number.parseInt(phone) : null,
        first_name: firstName,
        last_name: lastName,
        registered_with: email ? 'email' : 'phone'
      };

      try {
        const user = await User.create(new_user);
        if (user) {
          return res.status(201).json({
            status: true,
            user
          });
        }
      } catch (error) {
        return res.status(500).json({
          status: false,
          error
        });
      }
    });

  return router;
};

module.exports = routes;