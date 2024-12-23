const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const app = express();
const port = 3002;

mongoose.connect('mongodb://127.0.0.1:27017/JP1');


const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

//farmer
const farmerSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  unique_id: {
    type: String,
    required: true,
  },
  place: {
    type: String,
    required: true,
  },
  age: {
    type: Number,
    required: true,
  },
});

const Farmer = mongoose.model('Farmer', farmerSchema);

module.exports = Farmer;

const cropSchema = new mongoose.Schema({
  crop: {
    type: String,
    required: true,
  },
  time: {
    type: String,
    required: true,
  },
  crop_id: {
    type: String,
    required: true,
  },
  season: {
    type: String,
    required: true,
  },
});

const Crop = mongoose.model('Crop', cropSchema);

module.exports = Crop;

const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
uname: String,
  password: String,
});

const User = mongoose.model('User', userSchema);

app.use(bodyParser.urlencoded({ extended: true }));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.static(__dirname));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/page.html');
});

app.post('/register', (req, res) => {
    const userData = {
      fname: req.body.fname,
      lname: req.body.lname,
      password: req.body.password,
      uname: req.body.uname
    };
  
    User.create(userData)
      .then(user => {
        // Registration successful, handle user object
        res.redirect('/login'); // Redirect to login page
      })
      .catch(err => {
        console.error(err);
        res.send('An error occurred during registration');
      });
  });
  

// ... (previous code)

// ... (previous code)

app.post('/login', async (req, res) => {
    try {
      const { uname, password } = req.body;
  
      // Log the values received from the form for debugging
      console.log('Login attempt with uname:', uname, 'password:', password);
  
      const user = await User.findOne({ uname, password }).exec();
      if (!user) {
        console.log('User not found in the database');
        res.send('Login failed. Invalid credentials.');
      } else {
        console.log('Login successful');
        res.redirect('/hr.html');
      }
    } catch (err) {
      console.error(err);
      res.send('An error occurred during login.');
    }
  });
  


app.post('/update', (req, res) => { const { email, phone } = req.body;
const newUser = new User({ email, phone }); newUser.save(err => {
if (err) {
res.send('Update failed');
} else {
res.send('Update successful');
 
}
});
});



app.post('/delete', async (req, res) => {
  const confirmation = req.body['confirm-delete'];

  if (confirmation === 'DELETE') {
    const usernameToDelete = req.body.uname; // Get the username from the form input

    try {
      const user = await User.findOneAndDelete({ uname: usernameToDelete });
      if (!user) {
        res.status(404).send('User not found.');
      } else {
        res.send('User deleted successfully.');
      }
    } catch (err) {
      res.status(500).send('Error deleting user.');
    }
  } else {
    res.status(400).send('Confirmation text does not match. Account not deleted.');
  }
});




app.post('/admin', (req, res) => {
  const adminUsername = req.body.uname;
  const adminPassword = req.body.password;

  // Log the values received from the form for debugging

  // Check if the provided username and password match the admin credentials
  if (adminUsername === 'jp' && adminPassword === 'jp123') {
  res.redirect('/modified.html');
} else {
  res.send('Invalid credentials. Please try again.');
}

});


// Serve login.html
app.get('/login', (req, res) => {
  res.sendFile(__dirname + '/login.html');
});

// Serve home.html
app.get('/hr.html', (req, res) => {
  res.sendFile(__dirname + '/hr.html');
});




app.post('/addFarmer', async (req, res) => {
  const { name, unique_id, place, age } = req.body;

  try {
      const farmer = new Farmer({
          name,
          unique_id,
          place,
          age,
      });

      await farmer.save(); // Save the farmer to the database
      res.send('Farmer added successfully.');
  } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while adding the farmer.');
  }
});

app.post('/deleteFarmer', async (req, res) => {
  const uniqueIdToDelete = req.body.unique_id;
  
  // Log the unique ID received for debugging
  console.log('Unique ID to delete:', uniqueIdToDelete);

  try {
    const farmer = await Farmer.findOneAndDelete({ unique_id: uniqueIdToDelete });
    if (!farmer) {
      console.log('Farmer not found in the database');
      res.status(404).send('Farmer not found.');
    } else {
      console.log('Farmer deleted successfully');
      res.send('Farmer deleted successfully.');
    }
  } catch (err) {
    console.error(err);
    res.status(500).send('An error occurred while deleting the farmer.');
  }
});


app.get('/displayFarmers', async (req, res) => {
  try {
      const farmers = await Farmer.find({});
      // Convert the data to JSON and send it as a response
      res.json(farmers);
  } catch (err) {
      console.error(err);
      // Handle errors here
  }
});

app.get('/updateFarmer', (req, res) => {
  res.sendFile(__dirname + '/updateFarmer.html');
});

// Assuming you have an instance of Express called 'app'

app.post('/updateFarmer', async (req, res) => {
  const { unique_id, age, place } = req.body;

  try {
      const farmer = await Farmer.findOne({ unique_id }).exec();
      if (!farmer) {
          res.status(404).send('Farmer not found.');
      } else {
          farmer.age = age;
          farmer.place = place;

          await farmer.save(); // Save the updated farmer to the database

          res.send('Farmer information updated successfully.');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('An error occurred while updating the farmer.');
  }
});


app.post('/addCrop', (req, res) => {
  const { crop, time, crop_id, season } = req.body;

  // Create a new Crop instance with the form data
  const newCrop = new Crop({
      crop,
      time,
      crop_id,
      season,
  });

  // Save the crop data to the database
  newCrop.save()
      .then(() => {
          res.send('Crop added successfully.');
      })
      .catch(err => {
          console.error(err);
          res.status(500).send('An error occurred while adding the crop.');
      });
});

// Handle the crop deletion form submission


// Handle the crop deletion form submission
app.post('/deleteCrop', async (req, res) => {
  const cropIdToDelete = req.body.crop_id;

  try {
      // Use async/await to find and delete the crop based on cropIdToDelete
      const result = await Crop.findOneAndDelete({ crop_id: cropIdToDelete });

      if (!result) {
          res.status(404).send('Crop not found.');
      } else {
          res.send('Crop deleted successfully.');
      }
  } catch (err) {
      console.error(err);
      res.status(500).send('Error deleting crop.');
  }
});

app.get('/displayCrops', async (req, res) => {
  try {
      // Fetch the crop data from your database
      // Replace 'Crop' with the actual model name you've defined for crops
      const crops = await Crop.find({}).exec();

      // Send the crop data as a JSON response
      res.json(crops);
  } catch (error) {
      console.error(error);
      res.status(500).send('An error occurred while fetching crop data.');
  }
});



app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
