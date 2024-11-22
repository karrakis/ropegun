export const asynchronousStateUpdate = (updates, updateState) => {
  updates.then((toBeResolved) => {
    let updatesResolved = Promise.all(toBeResolved).then((data) => {
        debugger
        return data.map((update) => {
          return {
            [update.name]: update.data,
          };
        });
      });
      
      updatesResolved.then((updatesToAdd) => {
        updateState(Object.assign({}, ...updatesToAdd));
      });
    })
  }