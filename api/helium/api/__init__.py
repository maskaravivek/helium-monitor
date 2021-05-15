from .health_check_controller import health_check_api
from .root_controller import root_api
from .summary_controller import summary_api

def init_app(app):
    # register api blueprints...
    app.register_blueprint(health_check_api)
    app.register_blueprint(summary_api)
    app.register_blueprint(root_api)
    print("Initiated API...")
