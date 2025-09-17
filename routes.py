from flask import Blueprint, request, jsonify
from models import db, User, Job, Application
from werkzeug.security import generate_password_hash, check_password_hash

main = Blueprint('main', __name__)

# ----------------- User Register -----------------
@main.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}

    username = data.get('username')
    email = data.get('email')
    password = data.get('password')

    if not username or not email or not password:
        return jsonify({'message': 'All fields are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'message': 'Email already exists'}), 400

    hashed_password = generate_password_hash(password)
    user = User(username=username, email=email, password=hashed_password)
    db.session.add(user)
    db.session.commit()

    return jsonify({'message': 'Registration successful'}), 201


# ----------------- User/Admin Login -----------------
@main.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({'message': 'Email and password are required'}), 400

    # Admin login
    if email == "admin" and password == "admin123":
        return jsonify({'message': 'Admin login successful'}), 200

    user = User.query.filter_by(email=email).first()
    if not user or not check_password_hash(user.password, password):
        return jsonify({'message': 'Invalid credentials'}), 401

    return jsonify({'message': f'Welcome {user.username}!'}), 200


# ----------------- Get All Jobs -----------------
@main.route('/jobs', methods=['GET'])
def get_jobs():
    jobs = Job.query.all()
    return jsonify([{
        'id': job.id,
        'title': job.title,
        'description': job.description,
        'location': job.location,
        'posted_by': job.posted_by
    } for job in jobs])


# ----------------- Post Job (Admin) -----------------
@main.route('/post-job', methods=['POST'])
def post_job():
    data = request.get_json() or {}
    title = data.get('title')
    description = data.get('description')
    location = data.get('location')
    posted_by = data.get('posted_by')

    if not title or not description or not location or not posted_by:
        return jsonify({'message': 'All job fields are required'}), 400

    job = Job(title=title, description=description, location=location, posted_by=posted_by)
    db.session.add(job)
    db.session.commit()

    return jsonify({'message': 'Job posted successfully'}), 201


# ----------------- Apply Job -----------------
@main.route('/apply/<int:job_id>', methods=['POST'])
def apply_job(job_id):
    data = request.get_json() or {}
    user_email = data.get('user_email')

    if not user_email:
        return jsonify({'message': 'User email is required'}), 400

    if Application.query.filter_by(job_id=job_id, user_email=user_email).first():
        return jsonify({'message': 'Already applied'}), 400

    app_entry = Application(job_id=job_id, user_email=user_email)
    db.session.add(app_entry)
    db.session.commit()

    return jsonify({'message': 'Job applied successfully'}), 200


# ----------------- View Applicants (Admin) -----------------
@main.route('/admin/applicants/<int:job_id>', methods=['GET'])
def view_applicants(job_id):
    apps = Application.query.filter_by(job_id=job_id).all()
    result = []

    for app in apps:
        user = User.query.filter_by(email=app.user_email).first()
        job = Job.query.filter_by(id=app.job_id).first()

        result.append({
            "job_title": job.title if job else "N/A",
            "username": user.username if user else "N/A",
            "user_email": app.user_email
        })

    return jsonify(result)
