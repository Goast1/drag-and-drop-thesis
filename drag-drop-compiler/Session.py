import gc
from datetime import datetime, timedelta
import uuid
import json


class SessionManager:

    def __init__(self, db):
        self.sessions = {}
        self.db = db

    def create_session(self):
        session_id = str(uuid.uuid4())
        session_data = {
            'session_id': session_id,
            'code': json.dumps([]),
            'indents': 0,
            'sequence': json.dumps([]),
            'latest_activity': datetime.now().isoformat()
        }
        self.db.insert('sessions', session_data)
        return session_id

    def get_session(self, session_id):
        session_data = self.db.select('sessions', '*', {'session_id': session_id})
        if session_data:
            session_data = list(session_data)
            session_data[1] = json.loads(session_data[1])
            session_data[3] = json.loads(session_data[3])
            return dict(zip(['session_id', 'code', 'indents', 'sequence', 'latest_activity'], session_data))
        return None

    def update_session(self, session_id, data):
        data['code'] = json.dumps(data['code'])
        data['sequence'] = json.dumps(data['sequence'])
        data['latest_activity'] = datetime.now().isoformat()
        self.db.update('sessions', data, conditions={"session_id": session_id})

    def cleanup(self, time):
        cutoff_time = datetime.now() - timedelta(minutes=time)
        self.db.conn.execute("DELETE FROM sessions WHERE datetime(latest_activity) < datetime(?)", (cutoff_time.isoformat(),))
        self.db.conn.commit()

    def append_code(self, session_id, code, seq):
        session = self.get_session(session_id)
        if session:
            session['code'].append(code)
            session['sequence'].append(seq)
            self.update_session(session_id, session)

    def update_code(self, session_id, code, index):
        session = self.get_session(session_id)
        if session:
            session['code'][index] = code
            self.update_session(session_id, session)

    def remove_code(self, session_id, index):
        session = self.get_session(session_id)
        if session:
            for ind in index:
                ind = int(ind)
                session['code'][ind] = ""
                session['sequence'][ind] = ""
            self.update_session(session_id, session)

    def add_indent(self, session_id):
        session = self.get_session(session_id)
        if session:
            session['indents'] += 1
            self.update_session(session_id, session)

    def remove_indent(self, session_id):
        session = self.get_session(session_id)
        if session:
            session['indents'] = max(session['indents'] - 1, 0)
            self.update_session(session_id, session)