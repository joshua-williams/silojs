### Starting Web Server
The document root for the web server is the `public` directory. 
This directory should be used to store static assets such as images,
fonts, static html pages, etc.

To start the web server run:

`silo start`

The start command accepts two options
* **-p | --port** - The port number the web server listens on
* **-r | --root** - The document root directory. Default `public`