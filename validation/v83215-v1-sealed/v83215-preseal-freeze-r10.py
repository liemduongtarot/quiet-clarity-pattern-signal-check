from pathlib import Path
src=Path('validation/v83215-v1-sealed/v83215-preseal-freeze-r7.py').read_text()
repls={
"'Một túi courier giữ bản sao giấy tờ địa điểm.'":"'Một túi courier niêm phong giữ bản sao sơ đồ địa điểm, phiếu bàn giao quầy lễ tân và biên nhận vận chuyển nội bộ.'",
"'Một thùng storage ghi tháng retention.'":"'Một thùng storage lưu nhãn chu kỳ retention, danh mục vị trí kệ, biên bản kiểm kê và phiếu chuyển kho định kỳ.'",
"'Một batch scanner ghi số trang tiếp nhận.'":"'Một batch scanner ghi số trang tiếp nhận, trạng thái kiểm ảnh, mã hàng đợi số hóa và phiếu bàn giao tài liệu sang kho điện tử.'",
"'Một binder reception ghi số bàn booking.'":"'Một binder reception ghi số bàn booking, danh mục thiết bị quầy, tuyến chuyển cuộc gọi và lịch kiểm tra vật tư vận hành.'"}
for a,b in repls.items():
 if a not in src: raise SystemExit('missing '+a)
 src=src.replace(a,b,1)
src=src.replace('preseal-freeze-r7','preseal-freeze-r10').replace("'phase':'preseal-freeze-r7'","'phase':'preseal-freeze-r10'")
exec(compile(src,'v83215-preseal-freeze-r10.py','exec'))
