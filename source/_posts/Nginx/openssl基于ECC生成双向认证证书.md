---
title: openssl基于ECC生成二级可签发client的CA双向认证证书
abbrlink: b78a00fa
categories:
  - Nginx
tags:
  - 配置记录
  - SSL
  - Nginx
date: 2024-08-28 14:40:02
---


本文提到的 `client.crt` `server.crt` 都是通过ca签发的

## 证书生成命令

生成证书配置

```shell
1.签发CA证书
# 生成根CA公钥
openssl ecparam -out CA.key -name prime256v1 -genkey
 
# 生成证书CSR请求
openssl req -subj "/O=TEST Inc./CN=TEST Root CA" -new -key CA.key -out CA.csr
 
# 用根私钥签名CSR请求，生成自签名公钥证书
openssl x509 -req -days 3650 -in CA.csr -signkey CA.key -sha256 -extfile openssl.conf -extensions v3_ca -out CA.crt



2.签发二级CA
# 生成次级CA ECC密钥对
openssl ecparam -out 2CA.key -name prime256v1 -genkey
 
# 生成证书CSR请求
openssl req -subj "/O=TEST Inc./CN=TEST Certification Authority CN-D" -new -key 2CA.key -out 2CA.csr
 
# 用上述根证书签发次级CA证书
openssl x509 -req -days 3650 -in 2CA.csr -CA CA.crt -CAkey CA.key -sha256 -CAcreateserial -extfile openssl.conf -extensions v3_ca -out 2CA.crt

# 需要p12证书可以通过此命令生成
openssl pkcs12 -export -clcerts -in 2CA.crt -inkey 2CA.key -out 2CA.p12


3.签发client证书
# 生成示例ECC密钥对
openssl ecparam -out client.key -name prime256v1 -genkey
 
# 生成CSR
openssl req -subj "/O=TEST Inc./CN=TEST Certification Authority CN-E" -new -key client.key -config openssl.conf -extensions v3_req -out client.csr
 
# 用次级CA为示例公钥签发证书，注意这里的扩展使用的是v3_req而不是v3_ca
openssl x509 -req -days 3650 -in client.csr -CA 2CA.crt -CAkey 2CA.key -sha256 -set_serial 03 -extfile openssl.conf -extensions v3_req -out client.crt


#验证证书
openssl verify -verbose -CAfile 2CA.crt client.crt

openssl verify -verbose -CAfile <(cat CA.crt 2CA.crt) client.crt
```

```
使用ingress创建ca-secret的时候需要把CA.crt 和2CA.crt合并创建
```

### 使用curl测试

```bash
curl  --cert client.crt --key client.key  https://10.0.0.134
```

#### 签发二级CA需要再v3_ca里增加配置
```
basicConstraints = critical,CA:true
```
openssl.conf 配置文件详解
```

####################################################################
[ ca ]
default_ca = CA_default  # The default ca section

####################################################################
[ CA_default ]

dir  = ./demoCA  # Where everything is kept
certs  = $dir/certs  # Where the issued certs are kept
crl_dir  = $dir/crl  # Where the issued crl are kept
database = $dir/index.txt # database index file.
#unique_subject = no   # Set to 'no' to allow creation of
     # several ctificates with same subject.
new_certs_dir = $dir/newcerts  # default place for new certs.

certificate = $dir/cacert.pem  # The CA certificate
serial  = $dir/serial   # The current serial number
crlnumber = $dir/crlnumber # the current crl number
     # must be commented out to leave a V1 CRL
crl  = $dir/crl.pem   # The current CRL
private_key = $dir/private/cakey.pem# The private key
RANDFILE = $dir/private/.rand # private random number file

x509_extensions = usr_cert  # The extentions to add to the cert

# Comment out the following two lines for the "traditional"
# (and highly broken) format.
name_opt  = ca_default  # Subject Name options
cert_opt  = ca_default  # Certificate field options

default_days = 365   # how long to certify for
default_crl_days= 30   # how long before next CRL
default_md = default  # use public key default MD
preserve = no   # keep passed DN ordering

# A few difference way of specifying how similar the request should look
# For type CA, the listed attributes must be the same, and the optional
# and supplied fields are just that :-)
policy  = policy_match

# For the CA policy
[ policy_match ]
countryName  = match
stateOrProvinceName = match
organizationName = match
organizationalUnitName = optional
commonName  = supplied
emailAddress  = optional

# For the 'anything' policy
# At this point in time, you must list all acceptable 'object'
# types.
[ policy_anything ]
countryName  = optional
stateOrProvinceName = optional
localityName  = optional
organizationName = optional
organizationalUnitName = optional
commonName  = supplied
emailAddress  = optional

####################################################################
[ req ]
default_bits  = 1024
default_keyfile  = privkey.pem
distinguished_name = req_distinguished_name
attributes  = req_attributes
x509_extensions = v3_ca # The extentions to add to the self signed cert

# Passwords for private keys if not present they will be prompted for
# input_password = secret
# output_password = secret

# This sets a mask for permitted string types. There are several options. 
# default: PrintableString, T61String, BMPString.
# pkix  : PrintableString, BMPString (PKIX recommendation before 2004)
# utf8only: only UTF8Strings (PKIX recommendation after 2004).
# nombstr : PrintableString, T61String (no BMPStrings or UTF8Strings).
# MASK:XXXX a literal mask value.
# WARNING: ancient versions of Netscape crash on BMPStrings or UTF8Strings.
string_mask = utf8only

req_extensions = v3_req # The extensions to add to a certificate request

[ req_distinguished_name ]
countryName   = Country Name (2 letter code)
countryName_default  = CN
countryName_min   = 2
countryName_max   = 2

stateOrProvinceName  = State or Province Name (full name)
stateOrProvinceName_default = BeiJing

localityName   = Locality Name (eg, city)

0.organizationName  = Organization Name (eg, company)
0.organizationName_default = myca

# we can do this but it is not needed normally :-)
#1.organizationName  = Second Organization Name (eg, company)
#1.organizationName_default = World Wide Web Pty Ltd

organizationalUnitName  = Organizational Unit Name (eg, section)
#organizationalUnitName_default =

commonName   = Common Name (e.g. server FQDN or YOUR name)
commonName_max   = 64

emailAddress   = Email Address
emailAddress_max  = 64

# SET-ex3   = SET extension number 3

[ req_attributes ]
challengePassword  = A challenge password
challengePassword_min  = 4
challengePassword_max  = 20

unstructuredName  = An optional company name

[ usr_cert ]

# These extensions are added when 'ca' signs a request.

# This goes against PKIX guidelines but some CAs do it and some software
# requires this to avoid interpreting an end user certificate as a CA.

basicConstraints=CA:FALSE

# Here are some examples of the usage of nsCertType. If it is omitted
# the certificate can be used for anything *except* object signing.

# This is OK for an SSL server.
# nsCertType   = server

# For an object signing certificate this would be used.
# nsCertType = objsign

# For normal client use this is typical
# nsCertType = client, email

# and for everything including object signing:
nsCertType = client, email, objsign

# This is typical in keyUsage for a client certificate.
keyUsage = nonRepudiation, digitalSignature, keyEncipherment

# This will be displayed in Netscape's comment listbox.
nsComment   = "OpenSSL Generated Certificate"

# PKIX recommendations harmless if included in all certificates.
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid,issuer

# This stuff is for subjectAltName and issuerAltname.
# Import the email address.
# subjectAltName=email:copy
# An alternative to produce certificates that aren't
# deprecated according to PKIX.
# subjectAltName=email:move

# Copy subject details
# issuerAltName=issuer:copy

#nsCaRevocationUrl  =  http://www.domain.dom/ca-crl.pem
#nsBaseUrl
#nsRevocationUrl
#nsRenewalUrl
#nsCaPolicyUrl
#nsSslServerName

# This is required for TSA certificates.
# extendedKeyUsage = critical,timeStamping

[ svr_cert ]
basicConstraints=CA:FALSE
nsCertType   = server
keyUsage = nonRepudiation, digitalSignature, keyEncipherment, dataEncipherment, keyAgreement
authorityKeyIdentifier=keyid,issuer
extendedKeyUsage = serverAuth,clientAuth
[ v3_req ]
basicConstraints = CA:FALSE
keyUsage = nonRepudiation, digitalSignature, keyEncipherment

[ v3_ca ]
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid:always,issuer
basicConstraints = critical,CA:true

[ crl_ext ]
authorityKeyIdentifier=keyid:always

[ proxy_cert_ext ]

basicConstraints=CA:FALSE
nsComment   = "OpenSSL Generated Certificate"
subjectKeyIdentifier=hash
authorityKeyIdentifier=keyid,issuer
proxyCertInfo=critical,language:id-ppl-anyLanguage,pathlen:3,policy:foo

####################################################################
[ tsa ]

default_tsa = tsa_config1 # the default TSA section

[ tsa_config1 ]

# These are used by the TSA reply generation only.
dir  = ./demoCA  # TSA root directory
serial  = $dir/tsaserial # The current serial number (mandatory)
crypto_device = builtin  # OpenSSL engine to use for signing
signer_cert = $dir/tsacert.pem  # The TSA signing certificate
     # (optional)
certs  = $dir/cacert.pem # Certificate chain to include in reply
     # (optional)
signer_key = $dir/private/tsakey.pem # The TSA private key (optional)

default_policy = tsa_policy1  # Policy if request did not specify it
     # (optional)
other_policies = tsa_policy2, tsa_policy3 # acceptable policies (optional)
digests  = md5, sha1  # Acceptable message digests (mandatory)
accuracy = secs:1, millisecs:500, microsecs:100 # (optional)
clock_precision_digits  = 0 # number of digits after dot. (optional)
ordering  = yes # Is ordering defined for timestamps?
    # (optional, default: no)
tsa_name  = yes # Must the TSA name be included in the reply?
    # (optional, default: no)
ess_cert_id_chain = no # Must the ESS cert id chain be included?
    # (optional, default: no)
```