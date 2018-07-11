from typing import Iterator, List


def tail(file_path: str, rshift: int):
    with open(file_path, "rb") as f:
        return f.read()[-rshift:]


def rtail(file_path: str, rshift: int):
    with open(file_path, "rb") as f:
        return f.read()[:-rshift]


class TailCollection:
    def __init__(self, files: List[str], separator: bytes):
        self._files = files
        self._sep = separator
        self._i = 0

    def clear(self):
        rshift = self._rfind_common_shift()
        for f in self._files:
            head = rtail(f, rshift + len(self._sep))
            with open(f, "wb") as f:
                f.write(head)

    def append(self, data: bytes):
        assert self._i < len(self._files)

        with open(self._files[self._i], "ba") as output:
            output.write(self._sep)
            output.write(data)

        self._i += 1

    def _rfind_common_shift(self):
        rshift = []
        for f in self._files:
            with open(f, "rb") as f:
                data = f.read()
                rs = data.rfind(self._sep)
                assert rs != -1
                rshift.append(len(data) - rs - len(self._sep))

        return min(rshift)

    def __iter__(self) -> Iterator[bytes]:
        rshift = self._rfind_common_shift()
        for f in self._files:
            yield tail(f, rshift)
