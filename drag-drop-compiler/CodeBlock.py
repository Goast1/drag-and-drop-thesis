from utils import *


class CodeBlock:
    def __init__(self, identifier, code, var, val, valto, tag):
        self.identifier = identifier
        self.code = code
        self.var = var
        self.val = val
        self.valto = valto
        self.tag = tag
        self.block_id = generate_id()

    def extract(self):
        if self.identifier == 0:
            return f'{self.var} = {self.val}'
        elif self.identifier == 1:
            return f'print({self.val})'
        elif self.identifier == 2:
            if self.tag == "for":
                if self.code == "range":
                    return f'for {self.var} in range({self.val}):'
                if self.code == "range_len":
                    return f'for {self.var} in range(len({self.val})):'
                if self.code == "in":
                    return f'for {self.var} in {self.val}:'
            elif self.tag == "while":
                if self.code == "":
                    return f'while {self.var}:'
                if self.code == "not":
                    return f'while not {self.var}:'
                return f'while {self.var} {self.code} {self.val}:'

        elif self.identifier == 3:
            if self.code == "":
                return f'if {self.var}:'
            if self.code == "not":
                return f'if not {self.var}:'

            return f'if {self.var} {self.code} {self.val}:'

        elif self.identifier == 4:
            if self.code == "":
                if self.var == self.code == self.val in ['', None, ' ']:
                    return "else:"
                return f'elif {self.var}:'
            if self.code == "not":
                return f'elif not {self.var}:'

            return f'elif {self.var} {self.code} {self.val}:'

        elif self.identifier == 9:
            return "END"

        elif self.identifier == 10:
            return self.val
