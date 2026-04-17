import os
import re

root = r"C:\Users\huy81\.openclaw\workspace\tmp\laptrinhjava\backend\src\main\java"
pat = re.compile(r'"(PENDING|CONFIRMED|SHIPPING|DELIVERED|COMPLETED|CANCELLED|UNPAID|DEPOSIT_PAID|RELEASED|ACTIVE|SOLD_OUT|APPROVED|DISABLED|SUCCESS|FAILED)"')

for dp, _, fs in os.walk(root):
    for f in fs:
        if f.endswith('.java'):
            p = os.path.join(dp, f)
            with open(p, 'r', encoding='utf-8') as fh:
                for i, line in enumerate(fh, 1):
                    if pat.search(line):
                        print(f"{p}:{i}:{line.strip()}")
