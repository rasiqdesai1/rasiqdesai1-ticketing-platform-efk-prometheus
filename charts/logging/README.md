## Deploying EFK stack and Kube-prometheus-stack on kubernetes using Helm

<br>

### **Deploying on Digital Ocean Production Cluster**

Prerequisites:

1. A running Kubernetes cluster on DigitalOcean.
2. Installed [Doctl](https://docs.digitalocean.com/reference/doctl/how-to/install/) on your local system. Execute ```doctl auth init``` to initalize it.
3. Download the config file from the Digital ocean kubernetes cluster and connect to the cluster using ```doctl kubernetes cluster kubeconfig save <secret-specified-on-digital-ocean-k8s-cluster>```
4. Helm installed on your local system.


**Installing EFK charts**

- Add the `EFK` chart repo and pull the code for customizing the values using helm.
- The EFK chart we are using is `cryptexlabs/efk`. It can be found [here](https://artifacthub.io/packages/helm/cryptexlabs/efk).
 
  ```
     helm repo add cryptexlabs https://helm.cryptexlabs.com
     helm pull cryptexlabs/efk --version 7.8.0

  ```
- After downloading the charts into the local system, now we can customize the values according to our requirements.
- Untar the using `tar -xvzf <filename>`.
- As we would be deploying our stack on production-grade kubernetes cluster on digital ocean, we would like to keep the requirement values in other file rather than `values.yml`. 
  - I've created a file called `prod_values.yml` inside every chart **elasticsearch**, **kibana** and **fluentd** and following changes have been made for **elastisearch**,  **kibana** and **kibana**.

  ```
      readinessProbe:
        failureThreshold: 10
        initialDelaySeconds: 180
        periodSeconds: 10
        successThreshold: 3
        timeoutSeconds: 5
  ```

**Installing Kube-prometheus-stack charts**

- Add the `prometheus` chart repo and pull the code for customizing the values using helm.
- The prometheus we are using is 'prometheus-community/kube-prometheus-stack'. It can be found [here](https://artifacthub.io/packages/helm/prometheus-community/kube-prometheus-stack).

 ```   
     helm repo add prometheus-community https://prometheus-community.github.io/helm-charts
     helm pull prometheus-community/kube-prometheus-stack --version 33.2.0
 ```

- We would not be customizing the values of these charts, as this charts comes with precise values.

**Deploying**

- Now add this charts to the **charts/** directory inside this project folder **ticketing-platform**.
- Create separate github-actions file for deploying. One for **EFK** and the other for **prometheus**. The code can be found in the **.github/workflow** folder of this directory.
- We are using `digitalocean/action-doctl@v2` for adding the doctl support inside the workflow.
- We are also using `deliverybot/helm@v1` for adding the helm support inside the workflow. Further this action takes some arguments to execute the `prod_values.yml` file.
- Push the repo to GitHub, which then should trigger the workflow.</br>

### **Deploying on local kubernetes cluster**

**Prerequisites:**

1. Open the Docker Desktop console (Assuming the docker desktop is already installed, if not please install it.)
2. Go to settings and from the left side click on the Kubernetes panel.
3. Click on the “Enable Kubernetes“ option and apply & restart. Just like shown in the below image.

<img width="368" alt="Screenshot 2022-03-14 at 7 48 12 PM" src="https://user-images.githubusercontent.com/86670625/158191133-47f0920e-d527-47ed-afe8-358a9fa4f76a.png">

Now, both the docker and kubernetes are up and running. Our Initial setup is ready for the demo.

Now, let’s set up the demo.

1. Clone the repo from GitHub. 
2. `cd /efk/charts` 
3. This is the directory we would mostly be working on.
4. So, in each subfolder here  - elasticsearch, fluentd, Kibana, resides values.yaml.
5. Values.yaml has the values which need to be edited according to the requirements. As I am using a local cluster I would apply some changes in it.
6. I'm using a macbook and it comes up with the fixed resources, so our agenda would be to set up the cluster in this given resource.
7. In **charts/elasticsearch/examples/** here you would find so many examples to be used. I would be using docker-for-mac. You can use another example according to your requirements.
8. Use the values which are defined in the values.yaml inside the subfolder “docker-for-mac”. I would also be using replicas=1, minimumMasterNode=1.
9. After the changes, make sure **cd** into **charts/** directory and execute. 

 ```
       helm install es ./elasticsearch

      Where,  
        es = release name
 ```

10. This will initialize the elasticsearch pod and in some time you will see the  pod is up and running.
11. Now, let’s spin up the fluentd pod. Before deploying fluentd make sure your elasticsearch pod is running. 
12. Open the values.yaml inside efk/charts/fluentd and add the following Readinessprobe.


<img width="356" alt="Screenshot 2022-03-14 at 7 49 24 PM" src="https://user-images.githubusercontent.com/86670625/158191354-12d38452-5c5e-493c-86d7-e446ae58384e.png">

13. The fluentd pod fails deploying with the default values. So, the readinessProbe needs to be configured. Now, let’s install the fluentd chart.

 ```
      helm install fltd ./fluentd
 ```

14. Your pod must be up and running, it takes a few seconds.

 ```
          kubectl get pods
 ```
<img width="623" alt="Screenshot 2022-03-14 at 7 50 14 PM" src="https://user-images.githubusercontent.com/86670625/158191515-65bc3cd2-1635-4d1c-b743-9d6d5d987317.png">

15. Now let’s get our **Kibana pod** deployed. Before that, the **values.yaml** in kibana has resources which are more than our limits. We need to change those before we move further. Below are the values which need to be changed for the local deployment.


<img width="587" alt="Screenshot 2022-03-14 at 7 51 12 PM" src="https://user-images.githubusercontent.com/86670625/158191731-0f64cc14-38b3-4da2-8377-0f5e0d71abb5.png">


16. After you’ve made the changes, let’s deploy it and it must be up and running. After our whole EFK cluster has been deployed successfully, you can port-forward and check if we are able to get into the kibana console.

 ```
        helm install kib ./kibana
        
        kubectl get all
 ```

<img width="627" alt="Screenshot 2022-03-14 at 7 52 29 PM" src="https://user-images.githubusercontent.com/86670625/158191976-c37e8212-438d-497f-9a45-1a98db954767.png">

 ```
          kubectl port-forward kib-kibana-6f86bc84d-hhpzh 5601
 ```
17. Log into the browser and check **localhost:5601**, you must be able to view and log into it.


<img width="433" alt="Screenshot 2022-03-14 at 7 54 16 PM" src="https://user-images.githubusercontent.com/86670625/158192305-ccc89e70-2d20-406e-a2b7-107f94ac901c.png">

18. As we are able to access the kibana console, let’s deploy a sample application and check the logs for it in the kibana console. 
19. The Pod definition is available in the same MM-GitHub repository from which we pulled the EFK charts.
20. This is my Pod definition,

<img width="621" alt="Screenshot 2022-03-14 at 7 55 12 PM" src="https://user-images.githubusercontent.com/86670625/158192475-327fe117-160b-4d03-8223-c56aa5df2f5d.png">

21. Before deploying it make sure you have Namespace with name dev. If not please create it kubectl create ns dev.
22. Deploy it,  kubectl apply -f test_var.yaml, it would be up and running.
23.Now, let’s get back into the Kibana console, click on top left and in the kibana panel click on discover tab.

    1. Create an index pattern, add fluentd in it. Click next and create the pattern.

<img width="633" alt="Screenshot 2022-03-14 at 7 55 55 PM" src="https://user-images.githubusercontent.com/86670625/158192621-32d96d21-2695-45bd-acd4-5359fc9aa8b1.png">

24. Now, go back to the discover tab inside the Kibana Panel. You will see the logs of your kubernetes cluster in a while.
25. Sometimes, the pattern is not selected by default, in-cases where there are multiple index patterns. So in that case you would manually select the pattern to Fluentd.

<img width="423" alt="Screenshot 2022-03-14 at 7 56 30 PM" src="https://user-images.githubusercontent.com/86670625/158192719-23a8fa97-9a46-490c-a526-d38e8e21ec06.png">

26. By selecting it, you would see the logs of your kubernetes cluster and you also have an option to filter out the logs. In our case we  wanted to see the logs of the pod which is in the **dev namespace**. As you can see in the above picture, I have already applied a filter and gave a search. The logs of **dev** namespace can be viewed, as you can see in the below image.

<img width="629" alt="Screenshot 2022-03-14 at 7 57 21 PM" src="https://user-images.githubusercontent.com/86670625/158192888-99ed0682-b622-44f7-802c-3730ce02a3c2.png">

So, this way we can deploy a sample application on our local kubernetes cluster and also used EFK to find the logs.

