// server.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const cors = require('cors');
const bodyParser = require('body-parser');

// Import the API routes
const apiRoutes = require('./routes/api.js');

const app = express();
const PORT = 3000;

// folder containing static files
const publicFolder = path.join(__dirname, '../public');


// monbgo db connect
mongoose.connect('mongodb://127.0.0.1:27017/alexlv')
  .then(() => console.log('MongoDB connection established'))
  .catch(err => {
    console.error('Failed to connect to MongoDB:', err);
    process.exit(1);
  });


// Middleware
app.use(cors());
app.use(bodyParser.json());

// Serve static files
app.use(express.static(publicFolder));

// Use the API routes
app.use('/api', apiRoutes);


// Files fetch api 


// Helper function to recursively get all files and directories
function getFilesInDirectory(dirPath, relativePath = '') {
  const result = [];
  const files = fs.readdirSync(dirPath); 
  files.forEach(file => {
    const fullPath = path.join(dirPath, file);
    const stat = fs.statSync(fullPath); 
    const currentPath = path.join(relativePath, file); 

    if (stat.isDirectory()) {
      // If it's a directory, recurse and get its children
      result.push({
        name: file,
        type: 'directory',
        children: getFilesInDirectory(fullPath, currentPath), 
      });
    } else {
      result.push({
        name: file,
        type: 'file',
        path: currentPath, // Add relative path to the file
      });
    }
  });
  return result;
}

// API to fetch project files dynamically
app.get('/api/files', (req, res) => {
  const projectName = req.query.project; 
  if (!projectName) {
    return res.status(400).json({ error: 'Project name is required' });
  }

  const projectFolder = path.join(publicFolder, 'projects', projectName); // Path to the project folder

  if (!fs.existsSync(projectFolder)) {
    return res.status(404).json({ error: `Project '${projectName}' not found` });
  }

  const filesAndFolders = getFilesInDirectory(projectFolder);

  res.json(filesAndFolders); // Send the file structure as JSON
});


// Start the server
app.listen(PORT, () => {
  console.log(`Server is running at http://localhost:${PORT}`);
});
