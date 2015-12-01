# mesos-stateful-example

This repository contains a sample application exploring stateful applications
on a Mesos deployment.  This example runs on infrastructure on Azure using the
following Azure Resource Manager [template](https://github.com/jmspring/mesos-scalable-cluster/tree/glusterfs).

The basic setup is:

1.  Mesos / Marathon / Zookeeper deployed on master nodes
2.  GlusterFS deployed on a set of storage nodes
3.  Agent nodes use the [glusterfs volume driver](https://github.com/calavera/docker-volume-glusterfs)
4.  Docker version 1.9
