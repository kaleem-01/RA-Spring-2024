import pandas as pd
import os
import re

os.chdir('E:\Adoptee Study')

sheet = pd.read_excel('spreadsheet-final.xlsx')
sheet.columns

sheet['poser_id'][1:-1] = pd.Series([int(re.findall(r'\d+', i)[0]) for i in sheet['stimuli'][1:-1]])
sheet['poser_id']

for i in sheet['stimuli']: 
    print(i[:2])

sheet.to_excel('spreadsheet_v2.xlsx', index=False)