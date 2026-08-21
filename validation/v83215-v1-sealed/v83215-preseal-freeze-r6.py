from pathlib import Path
src=Path('validation/v83215-v1-sealed/v83215-preseal-freeze-r4.py').read_text()
# Preserve R5 index diversity improvements.
src=src.replace("'Thủ tục tiếp nhận duy trì một annotation lưu file chỉ để xử lý record.'","'Thủ tục tiếp nhận duy trì một annotation lưu file riêng cho kiểm kê hồ sơ, phân luồng tài liệu và bàn giao hành chính nội bộ.'",1)
src=src.replace("'Thủ tục đặt lịch giữ một ghi chú booking cho phối hợp hành chính.'","'Thủ tục đặt lịch giữ một ghi chú booking dành cho xác nhận phòng, phối hợp người tham dự và đối chiếu lịch vận hành.'",1)
# Break the remaining same-index cross-category collision with neutral category-specific logistics wording.
src=src.replace("'Một sheet địa điểm do bộ phận lịch trình quản lý.'","'Một hồ sơ điều phối địa điểm riêng do bộ phận lịch trình quản lý, bao gồm sơ đồ phòng và ghi chú vận hành cơ sở.'",1)
src=src.replace("'Bìa lưu hồ sơ chung do bộ phận records quản lý.'","'Một packet lưu trữ tổng hợp do bộ phận records quản lý, kèm quy tắc phân loại tài liệu và lịch luân chuyển nội bộ.'",1)
src=src.replace("preseal-freeze-r4","preseal-freeze-r6").replace("'phase':'preseal-freeze-r4'","'phase':'preseal-freeze-r6'")
exec(compile(src,'v83215-preseal-freeze-r6-wrapper.py','exec'))
