<div class="input-group-prepend">
    <a class="btn btn-lg dropdown-toggle country-btn border-right-0" href="#" role="button" id="menuCountryItem" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false" style="line-height:26px;">+86</a>

    <ul class="dropdown-menu country-menu" aria-labelledby="jobTypeSelector">
    <?php $tagCode = '常用'; ?>
    <li class="tag-code-item" ><?php echo $tagCode; ?></li>
    <li data-country-code="86" ><a class="country-item"><span>中国</span><span style="float:right">+86</span></a></li>
    <li data-country-code="1"><a class="country-item"><span>United States</span><span style="float:right">+1</span></a></li>
    <li data-country-code="61"><a class="country-item"><span>Australia</span><span style="float:right">+61</span></a></li>
    <?php $categoryItem = ''; ?>
    <?php foreach($countries as $item){ ?>
    <?php    $tagItem = mb_substr($item['name'], 0, 1); ?>
            <?php if($tagItem !== $categoryItem) { ?>
                <?php $categoryItem = $tagItem; ?>
                <li class="tag-code-item" style="background-color: #eee;"><?php echo $categoryItem; ?></li>
            <?php  }?>

            <?php if(isset($item['calling_code'])) { ?>
            <li data-country-code="<?php echo $item['calling_code'];?>">
                <a class="country-item">
                <span><?php echo $item['name']; ?></span>
                <span style="float:right;"><?php echo isset($item['calling_code']) ? '+'.$item['calling_code'] : '' ; ?></span>
                </a>
            </li>
            <?php } ?>
    <?php } ?>
    </ul>
</div>
