from pathlib import Path
src=Path('validation/v83215-v1-sealed/v83215-preseal-freeze-r8.py').read_text()
src=src.replace("'Một batch scanner ghi số trang tiếp nhận.'","'Một batch scanner ghi số trang tiếp nhận, trạng thái kiểm ảnh, mã hàng đợi số hóa và phiếu bàn giao tài liệu sang kho điện tử.'",1)
src=src.replace("'Một binder reception ghi số bàn booking.'","'Một binder reception ghi số bàn booking, danh mục thiết bị quầy, tuyến chuyển cuộc gọi và lịch kiểm tra vật tư vận hành.'",1)
src=src.replace('preseal-freeze-r8','preseal-freeze-r9').replace("'phase':'preseal-freeze-r8'","'phase':'preseal-freeze-r9'")
exec(compile(src,'v83215-preseal-freeze-r9-wrapper.py','exec'))
