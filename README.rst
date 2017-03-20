Bayesian Benchmark Dose (BBMD) web application
==============================================

Bayesian Benchmark Dose (BBMD) is a Python package for conducting benchmark
dose-response modeling for continuous and dichotomous Bayesian models using the
`Stan`_ probabilistic programming language.  This repository includes
source code for::

1. Backend web application website for executing user uploaded dose-response
   datasets, as well as a database implementation for storing and retrieving
   previously executed results using the `Django`_ web framework.
2. A frontend web application for displaying results to users including
   interactive web applications, implemented primarily using the `React`_ and
   `Redux`_ libraries

.. _`Stan`: http://mc-stan.org
.. _`Django`: https://www.djangoproject.com/
.. _`React`: https://facebook.github.io/react/
.. _`Redux`: http://redux.js.org/

Details on the BBMD modeling system, and performance comparison to other
tools such as the US EPA Benchmark Dose Modeling Software (`BMDS`_) is
documented in a peer-reviewed publication coming soon [submitted; reference
coming soon].

For more details on BBMD including installation/developer documentation,
see the `documentation`_ section of the github repository. The computation
portion of this web application is available in the companion `bbmd`_ repository.

.. _`documentation`: https://github.com/kanshao/bbmd_web/tree/master/docs
.. _`bbmd`: https://github.com/kanshao/bbmd

Written by `Kan Shao`_; implemented by `Andy Shapiro`_.

.. _`Kan Shao`: https://info.publichealth.indiana.edu/faculty/current/Shao-Kan.shtml
.. _`Andy Shapiro`: https://github.com/shapiromatron/
