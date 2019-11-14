/*******************************************************************************
 *
 *    Copyright 2019 Adobe. All rights reserved.
 *    This file is licensed to you under the Apache License, Version 2.0 (the "License");
 *    you may not use this file except in compliance with the License. You may obtain a copy
 *    of the License at http://www.apache.org/licenses/LICENSE-2.0
 *
 *    Unless required by applicable law or agreed to in writing, software distributed under
 *    the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR REPRESENTATIONS
 *    OF ANY KIND, either express or implied. See the License for the specific language
 *    governing permissions and limitations under the License.
 *
 ******************************************************************************/

'use strict';

const ci = new (require('./ci.js'))();

ci.context();

let config;

ci.dir('commerce-cif-connector', () => {
    config = ci.restoreConfiguration();
    console.log(config);
});

// TODO: Jacoco needs to be configured in container image
//ci.stage("Install Jacoco");
//ci.sh('mvn -B org.apache.maven.plugins:maven-dependency-plugin:get -Dartifact=org.jacoco:jacoco-maven-plugin:0.8.3');
//const jacocoAgentPath = ci.sh('mvn -X | grep "local repository" | cut -d " " -f6', true).trim() + '/org/jacoco/org.jacoco.agent/${version}/org.jacoco.agent-0.8.3-runtime.jar';
//     --vm-options '-javaagent:${jacocoAgentPath}=destfile=jacoco-it.exec'

ci.stage("Integration Tests");

// Connect to QP
ci.sh('./qp.sh -v bind --server-hostname localhost --server-port 55555');

// Start CQ
ci.sh(`./qp.sh -v start --id author --runmode author --port 4502 --qs-jar /home/circleci/cq/author/cq-quickstart.jar \
    --bundle org.apache.sling:org.apache.sling.junit.core:1.0.23:jar \
    --bundle com.adobe.commerce.cif:graphql-client:1.1.1:jar \
    --bundle com.adobe.commerce.cif:magento-graphql:4.0.0-magento233:jar \
    --bundle com.adobe.cq:core.wcm.components.all:2.4.0:zip \
    --install-file /home/circleci/cq/commerce-cif-connector/bundles/cif-connector-graphql/target/cif-connector-graphql-${config.modules['cif-connector-graphql'].version}.jar \
    --install-file /home/circleci/cq/commerce-cif-connector/bundles/cif-virtual-catalog/target/cif-virtual-catalog-${config.modules['cif-virtual-catalog'].version}.jar \
    --install-file /home/circleci/cq/commerce-cif-connector/content/cif-connector/target/cif-connector-content-${config.modules['cif-connector-content'].version}.zip \
    --install-file /home/circleci/cq/commerce-cif-connector/content/cif-virtual-catalog/target/cif-virtual-catalog-content-${config.modules['cif-virtual-catalog-content'].version}.zip \
    --install-file /home/circleci/cq/commerce-cif-connector/it/content/target/it-test-content-${config.modules['it-test-content'].version}.zip`);

// Run integration tests
ci.dir('commerce-cif-connector/it/http', () => {
    ci.sh(`mvn clean verify -U -B \
        -Ptest-all \
        -Dsling.it.instance.url.1=http://localhost:4502 \
        -Dsling.it.instance.runmode.1=author \
        -Dsling.it.instances=1`);
});

// Stop CQ
ci.sh('./qp.sh -v stop --id author');