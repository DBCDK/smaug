import nock from 'nock';

// include next line to get live data from the call
// nock.recorder.rec();

nock('https://borchk.addi.dk:443', {"encodedQueryParams":true})
  .get('/3.0/soap')
  .query({"wsdl":""})
  .reply(200, "<?xml version='1.0' encoding='UTF-8'?><!-- Published by JAX-WS RI (http://jax-ws.java.net). RI's version is Metro/2.4.3.payara-p5 (2.4.3.payara-maintenance-5307578; 2021-04-22T12:36:46+0100) JAXWS-RI/2.3.2.payara-p4 JAXWS-API/2.3.2 JAXB-RI/2.3.2 JAXB-API/2.3.2 git-revision#unknown. --><!-- BorChk version: 3.0 --><wsdl:definitions xmlns:wsdl=\"http://schemas.xmlsoap.org/wsdl/\" xmlns:soap=\"http://schemas.xmlsoap.org/wsdl/soap/\" xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" xmlns:borchk=\"http://oss.dbc.dk/ns/borchk\" xmlns:borchkw=\"http://oss.dbc.dk/ns/borchk_wsdl\" targetNamespace=\"http://oss.dbc.dk/ns/borchk_wsdl\">\n\t<wsdl:types>\n\t\t<xs:schema elementFormDefault=\"qualified\">\n\t\t\t<xs:import schemaLocation=\"https://borchk.addi.dk:443/3.0/soap?xsd=1\" namespace=\"http://oss.dbc.dk/ns/borchk\"/>\n\t\t</xs:schema>\n\t</wsdl:types>\n\t<wsdl:message name=\"borrowerCheckRequest\">\n\t\t<wsdl:part name=\"body\" element=\"borchk:borrowerCheckRequest\"/>\n\t</wsdl:message>\n\t<wsdl:message name=\"borrowerCheckResponse\">\n\t\t<wsdl:part name=\"body\" element=\"borchk:borrowerCheckResponse\"/>\n\t</wsdl:message>\n\t<wsdl:portType name=\"borrowerCheckPortType\">\n\t\t<wsdl:operation name=\"borrowerCheck\">\n\t\t\t<wsdl:input message=\"borchkw:borrowerCheckRequest\"/>\n\t\t\t<wsdl:output message=\"borchkw:borrowerCheckResponse\"/>\n\t\t</wsdl:operation>\n\t</wsdl:portType>\n\t<wsdl:binding name=\"borrowerCheckBinding\" type=\"borchkw:borrowerCheckPortType\">\n\t\t<soap:binding style=\"document\" transport=\"http://schemas.xmlsoap.org/soap/http\"/>\n\t\t<wsdl:operation name=\"borrowerCheck\">\n\t\t\t<soap:operation soapAction=\"borrowerCheck\"/>\n\t\t\t<wsdl:input name=\"borrowerCheckRequest\">\n\t\t\t\t<soap:body use=\"literal\"/>\n\t\t\t</wsdl:input>\n\t\t\t<wsdl:output name=\"borrowerCheckResponse\">\n\t\t\t\t<soap:body use=\"literal\"/>\n\t\t\t</wsdl:output>\n\t\t</wsdl:operation>\n\t</wsdl:binding>\n\t<wsdl:service name=\"borrowerCheckService\">\n\t\t<wsdl:port name=\"borrowerCheckPortType\" binding=\"borchkw:borrowerCheckBinding\">\n\t\t\t<soap:address location=\"https://borchk.addi.dk:443/3.0/soap\"/>\n\t\t</wsdl:port>\n\t</wsdl:service>\n</wsdl:definitions>", [ 'server',
    'Payara Server  5.2021.4 #badassfish',
    'x-powered-by',
    'Servlet/4.0 JSP/2.3 (Payara Server  5.2021.4 #badassfish Java/GraalVM Community/11)',
    'server',
    'grizzly/2.4.4',
    'content-type',
    'text/xml;charset=utf-8',
    'transfer-encoding',
    'chunked',
    'x-frame-options',
    'SAMEORIGIN',
    'strict-transport-security',
    'max-age=15552000',
    'connection',
    'close' ]);

nock('https://borchk.addi.dk:443', {"encodedQueryParams":true})
  .get('/3.0/soap')
  .query({"xsd":"1"})
  .reply(200, "<?xml version='1.0' encoding='UTF-8'?><!-- Published by JAX-WS RI (http://jax-ws.java.net). RI's version is Metro/2.4.3.payara-p5 (2.4.3.payara-maintenance-5307578; 2021-04-22T12:36:46+0100) JAXWS-RI/2.3.2.payara-p4 JAXWS-API/2.3.2 JAXB-RI/2.3.2 JAXB-API/2.3.2 git-revision#unknown. --><!-- BorChk version: 3.0 --><xs:schema xmlns:xs=\"http://www.w3.org/2001/XMLSchema\" xmlns:borchk=\"http://oss.dbc.dk/ns/borchk\" targetNamespace=\"http://oss.dbc.dk/ns/borchk\" elementFormDefault=\"qualified\" attributeFormDefault=\"unqualified\">\n\t<xs:element name=\"borrowerCheckRequest\">\n\t\t<xs:complexType>\n\t\t\t<xs:sequence>\n\t\t\t\t<xs:element ref=\"borchk:serviceRequester\"/>\n\t\t\t\t<xs:element ref=\"borchk:libraryCode\"/>\n\t\t\t\t<xs:element ref=\"borchk:userId\"/>\n\t\t\t\t<xs:element ref=\"borchk:userPincode\" minOccurs=\"0\"/>\n\t\t\t</xs:sequence>\n\t\t</xs:complexType>\n\t</xs:element>\n\t<xs:element name=\"borrowerCheckResponse\">\n\t\t<xs:complexType>\n\t\t\t<xs:sequence>\n\t\t\t\t<xs:element ref=\"borchk:userId\"/>\n\t\t\t\t<xs:element ref=\"borchk:requestStatus\"/>\n\t\t\t</xs:sequence>\n\t\t</xs:complexType>\n\t</xs:element>\n\t<xs:element name=\"libraryCode\" type=\"xs:string\">\n\t\t<xs:annotation>\n\t\t\t<xs:documentation xml:lang=\"en\">libraryCode must be the specific branch of the user, and not necessarily the the main library</xs:documentation>\n\t\t</xs:annotation>\n\t</xs:element>\n\t<xs:element name=\"requestStatus\" type=\"borchk:statusType\"/>\n\t<xs:element name=\"serviceRequester\" type=\"xs:string\"/>\n\t<xs:element name=\"userId\" type=\"xs:string\"/>\n\t<xs:element name=\"userPincode\" type=\"xs:string\"/>\n\t<xs:simpleType name=\"statusType\">\n\t\t<xs:restriction base=\"xs:string\">\n\t\t\t<xs:enumeration value=\"ok\"/>\n\t\t\t<xs:enumeration value=\"service_not_licensed\"/>\n\t\t\t<xs:enumeration value=\"service_unavailable\"/>\n\t\t\t<xs:enumeration value=\"library_not_found\"/>\n\t\t\t<xs:enumeration value=\"borrowercheck_not_allowed\"/>\n\t\t\t<xs:enumeration value=\"borrower_not_found\"/>\n\t\t\t<xs:enumeration value=\"borrower_not_in_municipality\"/>\n\t\t\t<xs:enumeration value=\"municipality_check_not_supported_by_library\"/>\n\t\t\t<xs:enumeration value=\"no_user_in_request\"/>\n\t\t\t<xs:enumeration value=\"error_in_request\"/>\n\t\t</xs:restriction>\n\t</xs:simpleType>\n</xs:schema>", [ 'server',
    'Payara Server  5.2021.4 #badassfish',
    'x-powered-by',
    'Servlet/4.0 JSP/2.3 (Payara Server  5.2021.4 #badassfish Java/GraalVM Community/11)',
    'server',
    'grizzly/2.4.4',
    'content-type',
    'text/xml;charset=utf-8',
    'transfer-encoding',
    'chunked',
    'x-frame-options',
    'SAMEORIGIN',
    'strict-transport-security',
    'max-age=15552000',
    'connection',
    'close' ]);

nock('https://borchk.addi.dk:443', {"encodedQueryParams":true})
  .post('/3.0/soap', "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"  xmlns:borchk=\"http://oss.dbc.dk/ns/borchk\" xmlns:borchkw=\"http://oss.dbc.dk/ns/borchk_wsdl\"><soap:Body><borchk:borrowerCheckRequest xmlns:borchk=\"http://oss.dbc.dk/ns/borchk\" xmlns=\"http://oss.dbc.dk/ns/borchk\"><borchk:userId>0</borchk:userId><borchk:userPincode>@716500</borchk:userPincode><borchk:libraryCode>DK-716500</borchk:libraryCode><borchk:serviceRequester>bibliotek.dk</borchk:serviceRequester></borchk:borrowerCheckRequest></soap:Body></soap:Envelope>")
  .reply(200, "<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Body><borrowerCheckResponse xmlns=\"http://oss.dbc.dk/ns/borchk\"><userId>0</userId><requestStatus>borrower_not_found</requestStatus></borrowerCheckResponse></S:Body></S:Envelope>", [ 'server',
    'Payara Server  5.2021.4 #badassfish',
    'x-powered-by',
    'Servlet/4.0 JSP/2.3 (Payara Server  5.2021.4 #badassfish Java/GraalVM Community/11)',
    'server',
    'grizzly/2.4.4',
    'content-type',
    'text/xml; charset=utf-8',
    'transfer-encoding',
    'chunked',
    'x-frame-options',
    'SAMEORIGIN',
    'strict-transport-security',
    'max-age=15552000',
    'connection',
    'close' ]);

nock('https://borchk.addi.dk:443', {"encodedQueryParams":true})
  .post('/3.0/soap', "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"  xmlns:borchk=\"http://oss.dbc.dk/ns/borchk\" xmlns:borchkw=\"http://oss.dbc.dk/ns/borchk_wsdl\"><soap:Body><borchk:borrowerCheckRequest xmlns:borchk=\"http://oss.dbc.dk/ns/borchk\" xmlns=\"http://oss.dbc.dk/ns/borchk\"><borchk:userId>0</borchk:userId><borchk:userPincode>wrong-password</borchk:userPincode><borchk:libraryCode>DK-716500</borchk:libraryCode><borchk:serviceRequester>bibliotek.dk</borchk:serviceRequester></borchk:borrowerCheckRequest></soap:Body></soap:Envelope>")
  .reply(200, "<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Body><borrowerCheckResponse xmlns=\"http://oss.dbc.dk/ns/borchk\"><userId>0</userId><requestStatus>borrower_not_found</requestStatus></borrowerCheckResponse></S:Body></S:Envelope>", [ 'server',
    'Payara Server  5.2021.4 #badassfish',
    'x-powered-by',
    'Servlet/4.0 JSP/2.3 (Payara Server  5.2021.4 #badassfish Java/GraalVM Community/11)',
    'server',
    'grizzly/2.4.4',
    'content-type',
    'text/xml; charset=utf-8',
    'transfer-encoding',
    'chunked',
    'x-frame-options',
    'SAMEORIGIN',
    'strict-transport-security',
    'max-age=15552000',
    'connection',
    'close' ]);

nock('https://borchk.addi.dk:443', {"encodedQueryParams":true})
  .post('/3.0/soap', "<soap:Envelope xmlns:soap=\"http://schemas.xmlsoap.org/soap/envelope/\" xmlns:xsi=\"http://www.w3.org/2001/XMLSchema-instance\"  xmlns:borchk=\"http://oss.dbc.dk/ns/borchk\" xmlns:borchkw=\"http://oss.dbc.dk/ns/borchk_wsdl\"><soap:Body><borchk:borrowerCheckRequest xmlns:borchk=\"http://oss.dbc.dk/ns/borchk\" xmlns=\"http://oss.dbc.dk/ns/borchk\"><borchk:userId>0</borchk:userId><borchk:userPincode>wrong-password</borchk:userPincode><borchk:libraryCode>DK-invalid-username</borchk:libraryCode><borchk:serviceRequester>bibliotek.dk</borchk:serviceRequester></borchk:borrowerCheckRequest></soap:Body></soap:Envelope>")
  .reply(200, "<?xml version='1.0' encoding='UTF-8'?><S:Envelope xmlns:S=\"http://schemas.xmlsoap.org/soap/envelope/\"><S:Body><borrowerCheckResponse xmlns=\"http://oss.dbc.dk/ns/borchk\"><requestStatus>error_in_request</requestStatus></borrowerCheckResponse></S:Body></S:Envelope>", [ 'server',
    'Payara Server  5.2021.4 #badassfish',
    'x-powered-by',
    'Servlet/4.0 JSP/2.3 (Payara Server  5.2021.4 #badassfish Java/GraalVM Community/11)',
    'server',
    'grizzly/2.4.4',
    'content-type',
    'text/xml; charset=utf-8',
    'transfer-encoding',
    'chunked',
    'x-frame-options',
    'SAMEORIGIN',
    'strict-transport-security',
    'max-age=15552000',
    'connection',
    'close' ]);
