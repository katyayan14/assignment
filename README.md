1) Project Overview
This project demonstrates a Secured CI/CD Pipeline. The goal was to take a ChatBot application and deploy it to the cloud (AWS) while ensuring that the infrastructure is safe from hackers.
The chatbot application is not an ordinary chatbot. It has different personas and with the help of prompt engineering we have achieved following :- 
•	The chatbot dosen’t reply with long detailed answers until asked.
•	It replies in bullet points .
•	Adds emoji to make it look more visually appealing.
•	Backed with gemini api allows multilingual support as well.
Instead of just "running the code," we implemented "Shift-Left Security," which means we checked for security flaws before the application ever went live.

2)Architecture
•	Code (GitHub): The source code and infrastructure rules (Terraform) are stored here.

•	Automation (Jenkins): Jenkins acts as the "manager." Whenever code changes, it automatically starts a build.

•	Security Scan (Trivy): Before deploying, a security tool called Trivy "reads" our infrastructure code to find mistakes like open ports or unencrypted data.

•	Deployment (Docker): Once the scan is clean, the app is packaged into a "container" (Docker) and pushed to our cloud server.

•	Cloud (AWS): The final application runs on an AWS EC2 instance.

3) Cloud Provider & Tools
•	Cloud Provider: AWS (Amazon Web Services)

•	CI/CD Tool: Jenkins

•	Security Scanner: Trivy (Infrastructure Scanning)

•	Containerization: Docker & Docker Compose

•	Infrastructure as Code: Terraform

•	Frontend: React / Vite

4) Before & After: The Security Flaws
BEFORE :-
 
<img width="1365" height="720" alt="J1" src="https://github.com/user-attachments/assets/635fd5b4-a2b0-4ce5-9b38-3f1847a7a84d" />




 <img width="1365" height="697" alt="J4" src="https://github.com/user-attachments/assets/37899ac7-cee1-4fc0-a883-57f4bd5af5c1" />




AFTER : - 


 <img width="1365" height="640" alt="J2" src="https://github.com/user-attachments/assets/0b48fdba-7311-43c6-9ecc-e822f4ea3817" />

 
<img width="1365" height="720" alt="J3" src="https://github.com/user-attachments/assets/f83fa2e9-1b23-4d41-97fb-ec783b41aef8" />
 

5) AI Usage Log
Phase	AI Prompt/Query	AI-Recommended Solution & Impact
1. Pipeline Automation	"Generate a Jenkins Groovy script (Jenkinsfile) to run a Trivy scan and deploy a Docker container."	Script Creation: AI provided the complete Jenkinsfile structure, defining the stages for Checkout, Security Scan, and Deployment.
2. Security Integration	"What is the specific Docker command to run a Trivy scan on a Terraform directory in Jenkins?"	Security Scanning: AI provided the docker run command for Trivy, allowing the pipeline to automatically audit the IaC code for misconfigurations.
3. Risk Identification	"Explain why Trivy is flagging AVD-AWS-0104 and AVD-AWS-0178 as Critical and Medium errors."	Vulnerability Analysis: AI explained that unrestricted egress and missing flow logs were major security gaps in the cloud architecture.
4. Infrastructure Fix	"Help me fix the critical error by restricting the egress rule in my main.tf."	Code Hardening: AI provided the refactored Terraform code to lock down network traffic and enable encryption, resulting in a 0-vulnerability report.
5. Resource Fixing	"Jenkins build is failing with 'No space left on device' on my AWS t2.micro instance."	Environment Optimization: AI provided the docker system prune commands to manage disk space, ensuring the pipeline could run on limited hardware.
6. App Development	"Generate a React Chat UI and explain how to integrate it with an AI API."	AI-Driven Dev: AI generated the frontend code and the logic for the ChatBot interface, demonstrating modern prompt-engineering techniques.

