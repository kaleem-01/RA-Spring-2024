# Preprocessing scripts for the adoptee data
Rscript scripts/adoptee_cleaning.R
python3 scripts/video_clean.py

# Knitting Markdown files
Rscript -e "rmarkdown::render('data_analyses/data_screening.Rmd')"
Rscript -e "rmarkdown::render('data_analyses/data_analyses.Rmd')"

echo "Press any key to quit"
read -n 1 -s
echo "exit"
