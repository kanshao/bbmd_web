# Development startup.

The development instructions describe setup for both the backend (a Python Django application with a PostgreSQL database), as well as the frontend (a React application with ES6 javascript using webpack).

Software requirements:

- Python 2.7 or Python 3.5+
- Node.js 6.0+
- PostgreSQL 9.4+

## Installation of backend, frontend, and database

Create a new python virtual environment, we'll use the name `bbmdweb` throughout
the documentation, though you can use whatever you'd like. Clone the github
repository:

```bash
git clone git@github.com:kanshao/bbmd_web.git
```

Next, `cd` to the `./project` path of this project. Install all python requirements:

```bash

pip install -r ../requirements/dev.txt
```

Copy default django local-development settings; change settings in the copy
as needed:

```
cp ./django_project/settings/local.example.py ./django_project/settings/local.py
```

Setup commands to start when activating the virtual environment:

```
echo "export DJANGO_SETTINGS_MODULE=django_project.settings.local" >> $VIRTUAL_ENV/bin/postactivate
echo "unset DJANGO_SETTINGS_MODULE" >> $VIRTUAL_ENV/bin/postdeactivate
```

Next, create a database. Use the following command:

```
createdb -E UTF-8 bbmdweb
```

Restart your virtual environment (`deactivate`, then `workon bbmdweb`). Sync
the database schema with what's been defined in the python project, and create
a new superuser to login to the admin, using these two commands, respectively:

```
python manage.py migrate
python manage.py createsuperuser
```

In the `./project` path of our project, run the following command, which installs required Javascript packages to our environment:

```
npm install --save-dev
```

## Running the development environment

To start coding, start the django backend application and the javascript frontend hot--reloading application. Execute these commands in two different terminal windows.

```bash
# first window
workon bbmdweb
cd ~/dev/bbmdweb/project/
python manage.py runserver 3000

# second window
workon bbmdweb
cd ~/dev/bbmdweb/project/
node webpack.devserver.js
```

Navigate to [localhost:3000](http://127.0.0.1:3000/), and start developing!
