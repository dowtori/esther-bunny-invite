import pandas as pd

file_path = r"C:\Users\1004\테스트\에스더버니 방문 인원.xlsx"
sheet_name = '최종 (선정 후 고료 표기본)시트'

try:
    df = pd.read_excel(file_path, sheet_name=sheet_name, header=None)
    
    # iterate through top 20 rows looking for where '이름', '계정명', '팔로워' or similar might be
    for i in range(20):
        row_values = [str(x) for x in df.iloc[i].values if pd.notna(x) and str(x).strip() != '']
        print(f"Row {i} ({len(row_values)} values):", row_values)
        
except Exception as e:
    print("Error:", e)
