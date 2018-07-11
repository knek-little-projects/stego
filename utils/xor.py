from typing import Iterator
import os


class XorableBytes(bytes):
    @classmethod
    def gen_random(cls, count):
        return cls(os.urandom(count))

    def __xor__(self, other):
        assert len(other) == len(self)
        return XorableBytes(self[i] ^ other[i] for i in range(len(self)))

    def xor_decompose(self):
        part1 = self.gen_random(len(self))
        part2 = part1 ^ self
        return part1, part2

    def factor_decompose(self, n):
        data = self
        for i in range(n - 1):
            part1, part2 = self.xor_decompose()
            yield part1
            data = part2
        yield data
