# Manager service
A service that runs all sources, collects results and provides a REST service.
```
/invoke?<source name>       Run source conversion again, if source parameter omitted, runs all
/refresh                    Refresh sources in sources/ directory
/status                     Returns current status as JSON
/                           HTTP return of some logs
```

