# Elastic Search Examples

The repository consists of elastic search examples and assignments of a Elastic Search Workshop.

## Instructions

### Docker Compose (Optional)

To run the container for ELK using docker-compose.

```bash
$ sudo docker-compose up elk
```
You may encounter a virtual-memory error when using in Linux. Add the following line to `/etc/sysctl.conf` file and save it.

`vm.max_map_count=262144`

Visit:

* `http://localhost:9200` for Elasticsearch JSON interface
* `http://localhost:5601` for Kibana web interface
* `http://localhost:5044` for Logstash Beats interface

### Running the queries

Run the Elastic Search queries from Kibana Web Interface in **Dev Tools**

## Week 1

* [Examples](https://github.com/awalesushil/elastic-search-examples/blob/master/Week%201/examples.es)
* [Assignment](https://github.com/awalesushil/elastic-search-examples/blob/master/Week%201/assignment.es)

## Week 2

* [Assignment](https://github.com/awalesushil/elastic-search-examples/blob/master/Week%202/assignment.es)

## Week 3

* [Assignment](https://github.com/awalesushil/elastic-search-examples/blob/master/Week%203/assignment.es)

## Week 4

* [Major Assignment](https://github.com/awalesushil/elastic-search-examples/blob/master/Week%204/major-assignment.es)