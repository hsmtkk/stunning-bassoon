// Copyright (c) HashiCorp, Inc
// SPDX-License-Identifier: MPL-2.0
import { Construct } from "constructs";
import { App, TerraformStack, CloudBackend, NamedCloudWorkspace } from "cdktf";
import * as google from '@cdktf/provider-google';

const project = 'stunning-bassoon';
const region = 'us-central1';
const repository = 'stunning-bassoon';

class MyStack extends TerraformStack {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    new google.provider.GoogleProvider(this, 'google', {
      project,
      region,
    });

    new google.cloudbuildTrigger.CloudbuildTrigger(this, 'trigger', {
      filename: 'gcp/cloudbuild.yaml',
      github: {
        owner: 'hsmtkk',
        name: repository,
        push: {
          branch: 'main',
        },
      },
    });

    new google.artifactRegistryRepository.ArtifactRegistryRepository(this, 'registry', {
      format: 'docker',
      location: region,
      repositoryId: 'registry',
    });

    const rails = new google.cloudRunService.CloudRunService(this, 'rails', {
      location: region,
      name: 'rails',
      template: {
        spec: {
          containers: [{
            image: 'us-docker.pkg.dev/cloudrun/container/hello',
          }],
        },
      },
    });

    const noauth = new google.dataGoogleIamPolicy.DataGoogleIamPolicy(this, 'noauth', {
      binding: [{
        members: ['allUsers'],
        role: 'roles/run.invoker',
      }],
    });

    new google.cloudRunServiceIamPolicy.CloudRunServiceIamPolicy(this, 'noauth-policy', {
      location: region,
      policyData: noauth.policyData,
      service: rails.name,
    });

  }
}

const app = new App();
const stack = new MyStack(app, "gcp");
new CloudBackend(stack, {
  hostname: "app.terraform.io",
  organization: "hsmtkkdefault",
  workspaces: new NamedCloudWorkspace("gcp")
});
app.synth();
