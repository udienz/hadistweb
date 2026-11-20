#!/usr/bin/env python3
"""Build src/lib/hadith/chapter-names-id.json: Indonesian chapter names for the seven books that have them.

Usage: python3 -I scripts/build-chapter-names.py [output.json]

The names come from IsmailHosenIsmailJames/compressed_hadith_sqlite (column `section_name_native` of the
`ind-{book}` databases). Its chapter ids are fawazahmed0's section numbers: checked 2026-11-20, the English name and
the hadith range of every chapter match fawazahmed0's info.json for all seven books. This script checks the English
names again and stops if one differs, so a change upstream cannot attach a name to the wrong chapter.
"""
import io
import json
import sqlite3
import sys
import tempfile
import urllib.request
import zipfile
from pathlib import Path

SQLITE = "https://raw.githubusercontent.com/IsmailHosenIsmailJames/compressed_hadith_sqlite/master/ind/ind-{book}.sqlite.zip"
INFO = "https://raw.githubusercontent.com/fawazahmed0/hadith-api/1/info.min.json"
BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah", "malik"]
OUT = Path(__file__).resolve().parent.parent / "src/lib/hadith/chapter-names-id.json"


def fetch(url):
    req = urllib.request.Request(url, headers={"User-Agent": "hadistweb-build"})
    with urllib.request.urlopen(req, timeout=120) as r:
        return r.read()


def main():
    out = Path(sys.argv[1]) if len(sys.argv) > 1 else OUT
    info = json.loads(fetch(INFO))
    result = {}
    with tempfile.TemporaryDirectory() as tmp:
        for book in BOOKS:
            archive = zipfile.ZipFile(io.BytesIO(fetch(SQLITE.format(book=book))))
            name = next(n for n in archive.namelist() if n.endswith(".sqlite"))
            archive.extract(name, tmp)
            rows = sqlite3.connect(Path(tmp) / name).execute(
                "select id, section_name, section_name_native from sections order by id"
            ).fetchall()
            source = info[book]["metadata"]["sections"]
            names = {}
            for number, english, native in rows:
                if source.get(str(number), "").strip() != (english or "").strip():
                    sys.exit(f"{book} chapter {number}: '{english}' here, '{source.get(str(number))}' in fawazahmed0")
                if native and native.strip() and native.strip() != english.strip():
                    names[str(number)] = native.strip()
            result[book] = names
            print(f"{book}: {len(names)} of {len(rows)} chapters named")
    out.write_text(json.dumps(result, ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(f"wrote {out}")


if __name__ == "__main__":
    main()
