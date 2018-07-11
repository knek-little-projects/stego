from subprocess import Popen, STDOUT, PIPE


class Cryptor:
    def __init__(self, input: bytes, cipher_algo="aes-256-cbc"):
        self._cipher_algo = cipher_algo
        self._input = input

    def encrypt(self) -> bytes:
        p = Popen(["openssl", self._cipher_algo, "-e", "-salt"], stdin=PIPE, stdout=PIPE)
        return p.communicate(self._input)[0]

    def decrypt(self) -> bytes:
        p = Popen(["openssl", self._cipher_algo, "-d"], stdin=PIPE, stdout=PIPE)
        return p.communicate(self._input)[0]
