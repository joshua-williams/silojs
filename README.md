# Silojs#

SiloJs allows developers to semantically wrap html code around Javascript objects. This lends the eloquent Silo Markup Language, pure html with silo xml namespace.

## Getting Started ##
Instantiate Silo Application.

Add silo.js to you page.

```
<script src="silojs/dist/silo.js"></script>
```

Then create an instance of silojs.
```
<body silo="ProjectManager" src="app/ProjectManager">
    <!-- your html code here -->
</body>
```

This creates a new Silo scope with a namespace of ProjectManager.  
The assets directory for ProjectManager is ./app/ProjectManager.  
The src attribute on a silo element will be used later as a prefix to controller paths.
```

<body silo="ProjectManager" src="app/ProjectManager">
	<silo:controller src="Controller.Index">
		This is the controller {{page.title}}
	</silo:controller>
</body>

```

Silojs will look for an anonymous function in ./app/ProjectManager/Controller/Index.js.
If a valid javascript anonymous function is returned it will be instantiated and stored as a variable at window.Silo.scope.*{{className}}*.

Any content within the silo:contorller tag will be parsed against the controller object from which it is referenced according to the Silo Template Syntax.

## Silo Each ##

With the silo-each attribute you can repeat the element and child nodes.

```
<script type="text/javascript">
	var products = [{
		title: 'Glass Cleaner',
		price: 20.00
	},{
		title: 'Tire Cleaner',
		price: 12.99
	},{
		title: 'Dash Shine',
		price: 7.99
	}];
	onRender = function(){
		alert('Each Render Complete');
	}	
</script>

<div silo-each="products as product" silo-index="idx" silo-callback="onRender" persist>
	<h3>{{product.title}}</h3>
	<p>Price: {{product.price}}</p>
</div>
```

The **silo-index** attribute allows you to determine the placeholder key for each iteration index. This defaults to *index*.

The **silo-callback** is an optional functionto call after the each component completes the rendering process.  It will pass a single parameter to the callback, the element in which the silo-each is defined.

The **persist** attribute, when present will enable automatic re-rendering of the each statment when a new element is pushed into the array.

## If Statements ##


```

<silo:if items.length>
	// if items.length is not falsie
</silo:if>

<silo:if items.length not="3">
	// if items.length is not equal to 3
</silo:if>

<silo:if items.length="{{maxLength}}">
	// if controller has property of maxLength and item.length == maxLength
</silo:if>

<silo:if items.length="{{maxLength()}}">
	// if controller has method of maxLength and item.length == maxLength()
</silo:if>

<silo:if items.length="{{maxLength || '3'}}">
	// ternary for (maxLength) ? maxLength : '3'
	// string value must be between single or double quotes when using silo curley bracket syntax
</silo:if>

<silo:if items.length="{{maxLength() || '3'}}">
	// ternary for (maxLength()) ? maxLength() : '3'
	// string value must be between single or double quotes when using silo curley bracket syntax
</silo:if>

<silo:if items.length match="[0-9]+">
	// match is a regular expression. this will match if subject is numeric
</silo:if>

<silo:if member="{{'Joshua' || 'Brandy' || 'Farrah' || 'Samarrah' || 'Alannah'}}">
	// if member is one of the following. Will return true on the first match
</silo:if>

<silo:if member="{{getFather() || 'Brandy' || getFarrah() || 'No Member'}}">
	// Can also use controller functions
</silo:if>
```
