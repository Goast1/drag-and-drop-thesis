import sqlite3


class Database:

    def __init__(self, db):
        self.conn = sqlite3.connect(db)

    def create_table(self, table_name, table_data, foreign_keys=None):
        columns = ', '.join([f"{key} {value}" for key, value in table_data.items()])
        foreign_key_constraints = ', '.join(
            [f"FOREIGN KEY({key}) REFERENCES {value}" for key, value in (foreign_keys or {}).items()])
        table_definition = f"{columns}, {foreign_key_constraints}" if foreign_keys else columns
        self.conn.execute(f'''CREATE TABLE IF NOT EXISTS {table_name} ({table_definition})''')

    def insert(self, table_name, data):
        keys = ', '.join(data.keys())
        placeholders = ', '.join(['?'] * len(data))
        values = tuple(data.values())
        print(f"INSERT INTO {table_name} ({keys}) VALUES ({placeholders})", values)
        self.conn.execute(f"INSERT INTO {table_name} ({keys}) VALUES ({placeholders})", values)
        self.conn.commit()

    def select(self, table_name, columns='*', conditions=None, fetchall=False):
        query = f"SELECT {columns} FROM {table_name}"
        if conditions:
            condition_strings = [f"{key} = ?" for key, value in conditions.items()]
            query += " WHERE " + " AND ".join(condition_strings)
            data = self.conn.execute(query, tuple(conditions.values()))
        else:
            data = self.conn.execute(query)
        if fetchall:
            return data.fetchall()
        return data.fetchone()

    def update(self, table_name, data, conditions):
        set_clause = ', '.join([f"{key} = ?" for key in data.keys()])
        condition_clause = ' AND '.join([f"{key} = ?" for key in conditions.keys()])
        values = tuple(data.values()) + tuple(conditions.values())
        query = f"UPDATE {table_name} SET {set_clause} WHERE {condition_clause}"
        self.conn.execute(query, values)
        self.conn.commit()
