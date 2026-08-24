from pathlib import Path
import sys
p=Path(sys.argv[1] if len(sys.argv)>1 else 'candidate/client/candidate.html')
s=p.read_text(encoding='utf-8')
old="if(e.response==='A10'&&!e.response_other.trim())return'RESPONSE_UNKNOWN';if(e.response==='A9')return'ADAPTIVE';if([rep,cross,exc,recent,infl,intr,trend].some(x=>x<0)||!e.impact||e.impact==='unknown')return'INSUFFICIENT';if(rep<=1||cross===0)return'SITUATIONAL';"
new="if(e.response==='A10')return'RESPONSE_UNKNOWN';if(e.response==='A9')return'ADAPTIVE';if([rep,cross,exc,recent,infl,intr,trend].some(x=>x<0)||!e.impact||e.impact==='unknown')return'INSUFFICIENT';if(e.impact==='none'&&infl>=1)return'INSUFFICIENT';if(e.impact==='none'&&infl===0)return'NO_MATERIAL_INFLUENCE';if(rep<=1||cross===0)return'SITUATIONAL';"
assert s.count(old)==1, 'classify contract changed unexpectedly'
s=s.replace(old,new,1)
old2="ADAPTIVE:'CHƯA THẤY PATTERN BẤT LỢI RÕ',INSUFFICIENT:'CHƯA ĐỦ BẰNG CHỨNG'"
new2="ADAPTIVE:'CHƯA THẤY PATTERN BẤT LỢI RÕ',NO_MATERIAL_INFLUENCE:'CHƯA THẤY ẢNH HƯỞNG THỰC TẾ ĐÁNG KỂ',INSUFFICIENT:'CHƯA ĐỦ BẰNG CHỨNG'"
assert s.count(old2)==1, 'state label contract changed unexpectedly'
s=s.replace(old2,new2,1)
old3="if(state==='INSUFFICIENT')parts.push('Một hoặc nhiều lớp bằng chứng hiện tại chưa đủ rõ hoặc đang cạnh tranh nhau.');"
new3="if(state==='INSUFFICIENT')parts.push('Một hoặc nhiều lớp bằng chứng hiện tại chưa đủ rõ hoặc đang cạnh tranh nhau.');if(state==='NO_MATERIAL_INFLUENCE')parts.push('Cách phản ứng có thể vẫn tồn tại, nhưng dữ liệu hiện tại chưa cho thấy nó đang tạo một ảnh hưởng thực tế đáng kể trong phần được kiểm tra.');"
assert s.count(old3)==1, 'uncertainty contract changed unexpectedly'
s=s.replace(old3,new3,1)
p.write_text(s,encoding='utf-8')
