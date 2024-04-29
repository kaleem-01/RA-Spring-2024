# This R file contains code to read and analyze preprocessed data from Gorilla
require(lme4)

# Read files
setwd("D:/RA - Spring 2024/Gorilla Data")
df <- na.omit(read.csv("preprocessed_adoptee.csv"))

df$culture <- as.factor(df$culture)
# df$ppn <- as.factor(df$ppn)

# Hypothesis 1
accuracy_fit_1 <- glmer(accuracy ~ culture + (1 | ppn1), 
                      data = df, 
                      family = binomial, 
                      control = glmerControl(optimizer = "bobyqa"),
                      nAGQ = 10)

accuracy_fit_2 <- glmer(accuracy ~ culture + (1 | ppn1/emotion), 
                      data = df, 
                      family = binomial, 
                      control = glmerControl(optimizer = "bobyqa"),
                      nAGQ = 10)


summary(accuracy_fit_1)
anova(accuracy_fit_1)

# Hypothesis 2
iden_fit <- lmer(likert ~ culture + (1 | ppn),
                 data=df)
anova(iden_fit)

# Hypothesis 3
glm_fit <- glmer(accuracy ~ culture + likert1 + (1 | ppn1),
                 data = df, 
                 family = binomial, 
                 control = glmerControl(optimizer = "bobyqa"),
                 nAGQ = 10)

glm_fit_2 <- glmer(accuracy ~ culture + likert1 + (1 | ppn1),
                 data = df, 
                 family = binomial)


summary(glm_fit)


