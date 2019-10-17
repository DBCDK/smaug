import nock from 'nock';

nock('https://borchk.addi.dk:443', {encodedQueryParams: true})
  .get('/2.5/')
  .query({wsdl: ''})
  .reply(
    200,
    '<?xml version="1.0" encoding="UTF-8"?>\n<wsdl:definitions xmlns:wsdl="http://schemas.xmlsoap.org/wsdl/" xmlns:soap="http://schemas.xmlsoap.org/wsdl/soap/" xmlns:xs="http://www.w3.org/2001/XMLSchema"  xmlns:borchk="http://oss.dbc.dk/ns/borchk" xmlns:borchkw="http://oss.dbc.dk/ns/borchk_wsdl" targetNamespace="http://oss.dbc.dk/ns/borchk_wsdl">\n\t<wsdl:types>\n\t\t<xs:schema elementFormDefault="qualified">\n\t\t\t<xs:import schemaLocation="borchk.xsd" namespace="http://oss.dbc.dk/ns/borchk"/>\n\t\t</xs:schema>\n\t</wsdl:types>\n\t<wsdl:message name="borrowerCheckRequest">\n\t\t<wsdl:part name="body" element="borchk:borrowerCheckRequest"/>\n\t</wsdl:message>\n\t<wsdl:message name="borrowerCheckResponse">\n\t\t<wsdl:part name="body" element="borchk:borrowerCheckResponse"/>\n\t</wsdl:message>\n\t<wsdl:portType name="borrowerCheckPortType">\n\t\t<wsdl:operation name="borrowerCheck">\n\t\t\t<wsdl:input message="borchkw:borrowerCheckRequest"/>\n\t\t\t<wsdl:output message="borchkw:borrowerCheckResponse"/>\n\t\t</wsdl:operation>\n\t</wsdl:portType>\n\t<wsdl:binding name="borrowerCheckBinding" type="borchkw:borrowerCheckPortType">\n\t\t<soap:binding style="document" transport="http://schemas.xmlsoap.org/soap/http"/>\n\t\t<wsdl:operation name="borrowerCheck">\n\t\t\t<soap:operation soapAction="borrowerCheck"/>\n\t\t\t<wsdl:input name="borrowerCheckRequest">\n\t\t\t\t<soap:body use="literal"/>\n\t\t\t</wsdl:input>\n\t\t\t<wsdl:output name="borrowerCheckResponse">\n\t\t\t\t<soap:body use="literal"/>\n\t\t\t</wsdl:output>\n\t\t</wsdl:operation>\n\t</wsdl:binding>\n\t<wsdl:service name="borrowerCheckService">\n\t\t<wsdl:port name="borrowerCheckPortType" binding="borchkw:borrowerCheckBinding">\n\t\t\t<soap:address location="https://borchk.addi.dk/2.5/"/>\n\t\t</wsdl:port>\n\t</wsdl:service>\n</wsdl:definitions>\n',
    [
      'Date',
      'Thu, 17 Oct 2019 09:35:02 GMT',
      'Server',
      'Apache/2.4.25 (Debian)',
      'Vary',
      'Accept-Encoding',
      'Content-Length',
      '1721',
      'Connection',
      'close',
      'Content-Type',
      'text/xml; charset="utf-8"'
    ]
  );

nock('https://borchk.addi.dk:443', {encodedQueryParams: true})
  .get('/2.5/borchk.xsd')
  .reply(
    200,
    '<?xml version="1.0" encoding="UTF-8"?>\n<!-- edited with XMLSpy v2012 (http://www.altova.com) by DBC A/S (DBC A/S) -->\n<xs:schema xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:borchk="http://oss.dbc.dk/ns/borchk" targetNamespace="http://oss.dbc.dk/ns/borchk" elementFormDefault="qualified" attributeFormDefault="unqualified">\n\t<xs:element name="borrowerCheckRequest">\n\t\t<xs:complexType>\n\t\t\t<xs:sequence>\n\t\t\t\t<xs:element ref="borchk:serviceRequester"/>\n\t\t\t\t<xs:element ref="borchk:libraryCode"/>\n\t\t\t\t<xs:element ref="borchk:userId"/>\n\t\t\t\t<xs:element ref="borchk:userPincode" minOccurs="0"/>\n\t\t\t\t<xs:element ref="borchk:callback" minOccurs="0"/>\n\t\t\t\t<xs:element ref="borchk:outputType" minOccurs="0"/>\n\t\t\t\t<xs:element ref="borchk:debugging" minOccurs="0"/>\n\t\t\t</xs:sequence>\n\t\t</xs:complexType>\n\t</xs:element>\n\t<xs:element name="borrowerCheckResponse">\n\t\t<xs:complexType>\n\t\t\t<xs:sequence>\n\t\t\t\t<xs:element ref="borchk:userId"/>\n\t\t\t\t<xs:element ref="borchk:requestStatus"/>\n\t\t\t</xs:sequence>\n\t\t</xs:complexType>\n\t</xs:element>\n\t<xs:element name="callback" type="xs:string">\n\t\t<xs:annotation>\n\t\t\t<xs:documentation xml:lang="en">If outputType=json.</xs:documentation>\n\t\t</xs:annotation>\n\t</xs:element>\n\t<xs:element name="libraryCode" type="xs:string">\n\t\t<xs:annotation>\n\t\t\t<xs:documentation xml:lang="en">libraryCode must be the specific branch of the user, and not necessarily the the main library</xs:documentation>\n\t\t</xs:annotation>\n\t</xs:element>\n\t<xs:element name="outputType" type="borchk:outputTypeType">\n\t\t<xs:annotation>\n\t\t\t<xs:documentation xml:lang="en">E.g. xml, json or php.</xs:documentation>\n\t\t</xs:annotation>\n\t</xs:element>\n\t<xs:element name="requestStatus" type="borchk:statusType"/>\n\t<xs:element name="serviceRequester" type="xs:string"/>\n\t<xs:element name="userId" type="xs:string"/>\n\t<xs:element name="userPincode" type="xs:string"/>\n\t<xs:element name="debugging" type="xs:boolean"/>\n\t<xs:simpleType name="outputTypeType">\n\t\t<xs:annotation>\n\t\t\t<xs:documentation xml:lang="en">The types of output that can be returned by the service.</xs:documentation>\n\t\t</xs:annotation>\n\t\t<xs:restriction base="xs:string">\n\t\t\t<xs:enumeration value="xml"/>\n\t\t\t<xs:enumeration value="json"/>\n\t\t\t<xs:enumeration value="php"/>\n\t\t</xs:restriction>\n\t</xs:simpleType>\n\t<xs:simpleType name="statusType">\n\t\t<xs:restriction base="xs:string">\n\t\t\t<xs:enumeration value="ok"/>\n\t\t\t<xs:enumeration value="service_not_licensed"/>\n\t\t\t<xs:enumeration value="service_unavailable"/>\n\t\t\t<xs:enumeration value="library_not_found"/>\n\t\t\t<xs:enumeration value="borrowercheck_not_allowed"/>\n\t\t\t<xs:enumeration value="borrower_not_found"/>\n\t\t\t<xs:enumeration value="borrower_not_in_municipality"/>\n\t\t\t<xs:enumeration value="municipality_check_not_supported_by_library"/>\n\t\t\t<xs:enumeration value="no_user_in_request"/>\n\t\t\t<xs:enumeration value="error_in_request"/>\n\t\t</xs:restriction>\n\t</xs:simpleType>\n</xs:schema>\n',
    [
      'Date',
      'Thu, 17 Oct 2019 09:35:02 GMT',
      'Server',
      'Apache/2.4.25 (Debian)',
      'Last-Modified',
      'Mon, 07 Oct 2019 05:24:53 GMT',
      'ETag',
      '"b4c-5944b457f9340"',
      'Accept-Ranges',
      'bytes',
      'Content-Length',
      '2892',
      'Vary',
      'Accept-Encoding',
      'Connection',
      'close',
      'Content-Type',
      'application/xml'
    ]
  );

nock('https://borchk.addi.dk:443', {encodedQueryParams: true})
  .post(
    '/2.5/',
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:borchk="http://oss.dbc.dk/ns/borchk" xmlns:borchkw="http://oss.dbc.dk/ns/borchk_wsdl"><soap:Body><borchk:borrowerCheckRequest xmlns:borchk="http://oss.dbc.dk/ns/borchk" xmlns="http://oss.dbc.dk/ns/borchk"><borchk:userId>0</borchk:userId><borchk:userPincode>@716500</borchk:userPincode><borchk:libraryCode>DK-716500</borchk:libraryCode><borchk:serviceRequester>bibliotek.dk</borchk:serviceRequester></borchk:borrowerCheckRequest></soap:Body></soap:Envelope>'
  )
  .reply(
    200,
    '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://oss.dbc.dk/ns/borchk"><SOAP-ENV:Body><borrowerCheckResponse><userId>0</userId><requestStatus>borrower_not_found</requestStatus></borrowerCheckResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>',
    [
      'Date',
      'Thu, 17 Oct 2019 09:35:02 GMT',
      'Server',
      'Apache/2.4.25 (Debian)',
      'Vary',
      'Accept-Encoding',
      'Content-Length',
      '317',
      'Connection',
      'close',
      'Content-Type',
      'text/xml; charset=utf-8'
    ]
  );
nock('https://borchk.addi.dk:443', {encodedQueryParams: true})
  .post(
    '/2.5/',
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:borchk="http://oss.dbc.dk/ns/borchk" xmlns:borchkw="http://oss.dbc.dk/ns/borchk_wsdl"><soap:Body><borchk:borrowerCheckRequest xmlns:borchk="http://oss.dbc.dk/ns/borchk" xmlns="http://oss.dbc.dk/ns/borchk"><borchk:userId>0</borchk:userId><borchk:userPincode>wrong-password</borchk:userPincode><borchk:libraryCode>DK-716500</borchk:libraryCode><borchk:serviceRequester>bibliotek.dk</borchk:serviceRequester></borchk:borrowerCheckRequest></soap:Body></soap:Envelope>'
  )
  .reply(
    200,
    '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://oss.dbc.dk/ns/borchk"><SOAP-ENV:Body><borrowerCheckResponse><userId>0</userId><requestStatus>borrower_not_found</requestStatus></borrowerCheckResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>',
    [
      'Date',
      'Thu, 17 Oct 2019 09:35:02 GMT',
      'Server',
      'Apache/2.4.25 (Debian)',
      'Vary',
      'Accept-Encoding',
      'Content-Length',
      '317',
      'Connection',
      'close',
      'Content-Type',
      'text/xml; charset=utf-8'
    ]
  );
nock('https://borchk.addi.dk:443', {encodedQueryParams: true})
  .post(
    '/2.5/',
    '<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"  xmlns:borchk="http://oss.dbc.dk/ns/borchk" xmlns:borchkw="http://oss.dbc.dk/ns/borchk_wsdl"><soap:Body><borchk:borrowerCheckRequest xmlns:borchk="http://oss.dbc.dk/ns/borchk" xmlns="http://oss.dbc.dk/ns/borchk"><borchk:userId>0</borchk:userId><borchk:userPincode>wrong-password</borchk:userPincode><borchk:libraryCode>DK-invalid-username</borchk:libraryCode><borchk:serviceRequester>bibliotek.dk</borchk:serviceRequester></borchk:borrowerCheckRequest></soap:Body></soap:Envelope>'
  )
  .reply(
    200,
    '<?xml version="1.0" encoding="UTF-8"?><SOAP-ENV:Envelope xmlns:SOAP-ENV="http://schemas.xmlsoap.org/soap/envelope/" xmlns="http://oss.dbc.dk/ns/borchk"><SOAP-ENV:Body><borrowerCheckResponse><userId>0</userId><requestStatus>error_in_request</requestStatus></borrowerCheckResponse></SOAP-ENV:Body></SOAP-ENV:Envelope>',
    [
      'Date',
      'Thu, 17 Oct 2019 09:35:03 GMT',
      'Server',
      'Apache/2.4.25 (Debian)',
      'Vary',
      'Accept-Encoding',
      'Content-Length',
      '315',
      'Connection',
      'close',
      'Content-Type',
      'text/xml; charset=utf-8'
    ]
  );
