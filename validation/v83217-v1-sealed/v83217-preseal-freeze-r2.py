from pathlib import Path
src=Path('validation/v83217-v1-sealed/v83217-preseal-freeze.py').read_text()
repls={
"'Scanner ledger đếm batch số hóa.'":"'Scanner ledger của kho số hóa ghi batch ảnh, checksum manifest, tuyến kiểm chất lượng và thời điểm bàn giao sang archive điện tử.'",
"'Nhãn carton ghi chu kỳ archive.'":"'Nhãn carton của kho retention ghi chu kỳ lưu, sơ đồ kệ, mã kiểm kê vật lý và phiếu điều chuyển giữa các khu storage.'"
}
for a,b in repls.items():
 if a not in src: raise SystemExit('missing '+a)
 src=src.replace(a,b,1)
src=src.replace("'phase':'preseal-freeze-v1'","'phase':'preseal-freeze-r2'",1)
exec(compile(src,'v83217-preseal-freeze-r2.py','exec'))
