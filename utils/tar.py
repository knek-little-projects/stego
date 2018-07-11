from subprocess import Popen, STDOUT, PIPE


class Tar:
    def __init__(self, raw: bytes):
        self.raw = raw

    @classmethod
    def from_files(cls, files: list):
        return cls(Popen(["tar", "czv"] + files, stdout=PIPE).communicate()[0])

    def unpack(self, target_directory: str):
        Popen(["tar", "xzv", "--directory", target_directory], stdin=PIPE).communicate(self.raw)

    def view(self):
        return Popen(["tar", "tzv"], stdin=PIPE, stdout=PIPE).communicate(self.raw)[0]
