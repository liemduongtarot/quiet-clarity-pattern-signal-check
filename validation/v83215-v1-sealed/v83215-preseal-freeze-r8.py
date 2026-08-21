from pathlib import Path
src=Path('validation/v83215-v1-sealed/v83215-preseal-freeze-r7.py').read_text()
src=src.replace("'Một túi courier giữ bản sao giấy tờ địa điểm.'","'Một túi courier niêm phong giữ bản sao sơ đồ địa điểm, phiếu bàn giao quầy lễ tân và biên nhận vận chuyển nội bộ.'",1)
src=src.replace("'Một thùng storage ghi tháng retention.'","'Một thùng storage lưu nhãn chu kỳ retention, danh mục vị trí kệ, biên bản kiểm kê và phiếu chuyển kho định kỳ.'",1)
src=src.replace('preseal-freeze-r7','preseal-freeze-r8').replace("'phase':'preseal-freeze-r7'","'phase':'preseal-freeze-r8'")
exec(compile(src,'v83215-preseal-freeze-r8-wrapper.py','exec'))
