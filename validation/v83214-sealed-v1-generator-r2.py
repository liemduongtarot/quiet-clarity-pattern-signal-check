from pathlib import Path
p=Path('validation/v83214-sealed-v1-generator.py')
s=p.read_text()
old_pair="pair=(EN if lang=='EN' else VI)[m][(i+mi)%3];ctx=(CTX_EN if lang=='EN' else CTX_VI)[domain][(i//3+mi)%3];tail=(TAIL_EN if lang=='EN' else TAIL_VI)[(i+2*mi)%3]"
new_pair="pair=(EN if lang=='EN' else VI)[m][(i+mi+i//3)%3];ctx=(CTX_EN if lang=='EN' else CTX_VI)[domain][(i//3+mi)%3];tail=(TAIL_EN if lang=='EN' else TAIL_VI)[(i+2*mi+i//3)%3]"
assert old_pair in s
extras="""EXTRA_EN=[
'The bookkeeping marker only locates the administrative file.',
'Calendar metadata only shows where this item sits procedurally.',
'The stored code belongs to ordinary paperwork.',
'The scheduling record only marks external work order.',
'Routine documentation only confirms the procedural entry already exists.',
'The reference code belongs solely to the logistics layer.',
'Administrative metadata only fixes the basic arrangement.',
'The ordinary record only captures a procedural timestamp.',
'The standard note only supplies routine operational detail.']
EXTRA_VI=[
'Marker sổ sách chỉ định vị phần hành chính của hồ sơ.',
'Metadata lịch chỉ cho biết nơi mục này nằm trong quy trình.',
'Mã lưu trữ thuộc phần giấy tờ thường ngày.',
'Record lịch trình chỉ đánh dấu thứ tự công việc bên ngoài.',
'Tài liệu thường lệ chỉ xác nhận phần thủ tục đã có.',
'Mã tham chiếu thuộc riêng lớp logistics của hồ sơ.',
'Metadata hành chính chỉ cố định phần sắp xếp cơ bản.',
'Record thường ngày chỉ ghi lại mốc thủ tục.',
'Ghi chú chuẩn chỉ cung cấp dữ kiện vận hành thông thường.']
"""
assert 'cases=[]' in s
s=s.replace('cases=[]',extras+'\ncases=[]',1)
old_surface="surface=(ctx+' '+core) if mode==0 else (core+' '+ctx) if mode==1 else (ctx+' '+core+' '+tail) if mode==2 else (core+' '+tail+' '+ctx)"
new_surface="surface=((ctx+' '+core) if mode==0 else (core+' '+ctx) if mode==1 else (ctx+' '+core+' '+tail) if mode==2 else (core+' '+tail+' '+ctx))+' '+((EXTRA_EN if lang=='EN' else EXTRA_VI)[(i+2*mi)%9])"
assert old_surface in s
s=s.replace(old_pair,new_pair,1).replace(old_surface,new_surface,1)
exec(compile(s,str(p),'exec'))
