Annotation website

- a website for handling language technology data
- created in VueJS
- the website sends data to server in JSON format
- the server is created with Python Flask Shelve framework, <a href="https://github.com/fginter/flask_shelve">available in Github</a>
- the annotation files (named as "comments_x.json", x being the file's index number) are fetched from a folder named "documents"
- the data is sent to the server when either the dropdown or checkbox is selected


-- The code was originally planned and written by someone else. I made some alterations to the way the data is saved to the server.
