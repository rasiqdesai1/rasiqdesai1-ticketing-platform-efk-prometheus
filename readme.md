Installation

Steps on Local Machine:
1. /etc/hosts
    ```
    127.0.0.1 ticketing.dev
    ```

2. Kubernetes:  Install ingress-nginx Controller
    ```
    kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/cloud/deploy.yaml
    ```

3. Skaffold with Helm:
    ```
    skaffold dev -f skaffold-helm.yaml
    skaffold dev -f skaffold-helm.yaml --dry-run --debug
    ```

4. Helm:
    ```
    cd charts
    helm install full-coral . -f environments/values.dev.yaml
    ```


Additional:
- Kubernetes: Port Forwarding  
    ```
    kubectl port-forward nats-depl-7db8b75544-zdhlf 4222:4222
    ```



HELM:
  ```
    - cd charts
    - helm install full-coral . -f environments/values.dev.yaml
    - helm uninstall full-coral
    - helm repo add ingress-nginx https://kubernetes.github.io/ingress-nginx
    - helm install nginx-ingress ingress-nginx/ingress-nginx --set controller.publishService.enabled=true
  ```


Secret Keys:
  ```
    kubectl create secret generic jwt-secret --from-literal=JWT_KEY=asdk
  
    kubectl create secret generic stripe-secret --from-literal=STRIPE_KEY=sk_test_51KRyt5HFXXNaLEcrxloHXkSVTj5Knwzd0Eom9DsZ6cQByxGUAvVBzgCJDU8WVZCi1j65jccxEtk3tvbpi1kwL3Su00LrW8Jzf3
  ```


Digital Ocean
  Load Balancer:

	kubectl apply -f https://raw.githubusercontent.com/kubernetes/ingress-nginx/controller-v1.1.1/deploy/static/provider/do/deploy.yaml
