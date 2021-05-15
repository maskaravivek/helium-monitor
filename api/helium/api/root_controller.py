from ..constants.global_constants import COMMON_PREFIX
from ..utils.api import handle_response
from flask import Blueprint, request, abort
from flask import current_app as app
from flask_migrate import init, migrate, upgrade, Migrate
from sqlalchemy_utils import database_exists, create_database
import os, json

root_api = Blueprint('root', __name__)

@root_api.route(COMMON_PREFIX + "/init", methods=['GET'])
def get_init_api():

    if app.config['ADMIN_TOKEN'] != request.args.get('token'):
        abort(404)

    db_uri = app.config['SQLALCHEMY_DATABASE_URI']

    if database_exists(db_uri):
        return handle_response({
            'message': 'db already exists',
        }, 422)

    ## Create DB
    create_database(db_uri)

    ## Migrate table structure
    migrate = Migrate()
    migrate.init_app(app, db)

    from os.path import dirname, abspath
    d = "%s/migrations" % dirname(dirname(dirname(abspath(__file__))))

    upgrade(directory=d)

    return handle_response({
        'status': 'ok',
    })

@root_api.route(COMMON_PREFIX + "/", methods=['GET'])
def get_root_api():
    return handle_response({'status': 'OK'})

# Left here for testing
# @root_api.route(COMMON_PREFIX + "/env", methods=['GET'])
# def get_env_api():
#     return handle_response(json.loads(json.dumps(dict(os.environ))))
