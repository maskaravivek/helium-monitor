## Used to configure app, be careful
import os

def set_app_config(app):
    db_uri = os.environ.get('SQLALCHEMY_DATABASE_URI')
    version = os.environ.get('VERSION')

    app.config['ADMIN_TOKEN'] = os.environ.get('ADMIN_TOKEN')
    app.config['SQLALCHEMY_DATABASE_URI'] = db_uri
    app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

    if os.environ.get('ENVIRONMENT') == 'stage-branch':
        app.config['SQLALCHEMY_DATABASE_URI'] = "%s_%s" % (db_uri, version)

    return app
