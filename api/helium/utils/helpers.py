ALLOWED_RESUME_EXTENSIONS = {'pdf'}
ALLOWED_PROFILE_PIC_EXTENSIONS = {'jpg', 'jpeg', 'png'}

# function to check file extension


def allowed_resume_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_RESUME_EXTENSIONS
    
def allowed_profile_pic_file(filename):
    return '.' in filename and \
        filename.rsplit('.', 1)[1].lower() in ALLOWED_PROFILE_PIC_EXTENSIONS

def get_file_extension(filename):
    return filename.rsplit('.', 1)[1].lower()

